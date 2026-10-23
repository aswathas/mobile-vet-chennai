# Repair pass — household allocation and the verdict rule

The first pass produced a good raw dataset and three real defects. Fix them in
place. Keep everything that is working.

## What is already working. Do not rebuild it.

- The collection scripts in `_work/`: census, GCC street ledger, OSM places,
  roads and vets, property tax, geocoding.
- The 50 localities, their identity, coordinates, ward, pin codes, route
  clusters, travel times, competitor names and prices.
- The hour curves, the weekday split, the seasonality index, the competition
  map, the cluster assets, the two service mixes and the price ladder.

## Defect 1. The household estimate ignores the ward totals the script already computes

`build_localities.py` computes `ward_hh`, a census-plus-property-tax household
total for every ward, and it is correct: the city figure is about 1.73 million
households and the ward figures run from about 2,500 to about 21,000.

It then never uses it for the locality. The locality household figure is
`token_count * TYPE_HH_PER_TOKEN[ltype] * built`, a street-token count times a
built-form constant. That is a token count dressed up as a household count.

The result: 5,567 households for a corridor that holds hundreds of thousands,
seven localities with zero households, twenty-one with zero pet-owning
households, and a zone total three orders of magnitude below the ward totals
the same script computed.

### The fix

Allocate households from the ward totals, using each locality's built weight to
split its ward.

1. Move the OSM feature counts that the script already computes
   (`apartments_n`, `gated_n`, from `nearby()`) so they are available before
   the household block. They are tier A and already paid for.
2. Build the weight for each locality as:

   weight_i = apartments_n_i + gated_n_i + 1

   The `+1` keeps a locality that OSM does not know from collapsing to zero.
3. Compute the zone household pool from the wards the fifty localities actually
   sit in, not from every ward in the ledger:

   ZONE_HH = sum(ward_hh[w] for w in wards_used_by_the_50_localities)
4. Allocate:

   households_i = ZONE_HH * weight_i / sum(weight_j for all 50 localities)

   This conserves the census-derived total across the zone. The assumption it
   rests on, and which MODEL.md must state plainly, is that the fifty
   localities tile their wards, so the ward household total belongs to them.
5. Recompute everything downstream from the new household figure using the
   rates already in the script: `TYPE_ANIMALS_PER_100HH`,
   `TYPE_VISITS_PER_HH_YEAR` and `LICENCE_PENETRACTION` for the licence split.
   Then recompute `demand`, `economics`, `serviceable_ceiling` and the zone
   summary from the new cases.

### Sanity bands. Check these before you write the file.

- Every locality has at least 300 households and at most 40,000.
- The zone household total is within 10 percent of `ZONE_HH`.
- Pet-owning households are between 15 and 30 percent of households.
- Cases a month per household sits between 0.05 and 0.25.
- No locality has zero pet-owning households.

If any band fails, the weight formula is wrong. Fix the formula, not the band.

## Defect 2. The verdict rule ignores demand

The score is `demand * 0.010 + margin * 0.35 - saturation * 0.30 +
households * 0.0009 + blended_price * 0.10`, and the thresholds are absolute
numbers (`< 40` is NO-GO, `< 62` is HOLD). Those thresholds were tuned against
the broken household scale, and the score weights demand too weakly. The result
is that a locality with zero modelled cases a month is ranked 1 and marked GO.

### The fix

Replace the score-and-threshold rule with an explicit rule that reads the same
way in every row, and rank by prize rather than by a composite:

- **GO** when all four hold: our-mix blended price is at or above Rs 1,100;
  margin over the Rs 850 clustered cost is at least Rs 250; cases a month are
  at least 40; and the competition saturation index is below 70.
- **HOLD** when cases a month are at least 15 but one of the four fails.
- **NO-GO** when cases a month are below 15, or when the margin is below
  Rs 100.

Rank by our-mix monthly revenue potential, highest first. Rank 1 is the biggest
prize, not the best score.

Every reason string must state cases a month, households, the blended price,
the margin over the Rs 850 cost, the saturation index and the number of named
operators. A locality with zero or near-zero cases can never be GO, and its
reason string must say why in plain words.

## Defect 3. Three documents were never written

The first pass ran out of steps before writing them. Write all three.

- **`SOURCES.md`** — every source with its full URL and what it was used for:
  the census dataset, the GCC street ledger, the GCC press releases, the
  property-tax ledger, OSM, the operator price pages, and the spine report.
  Mark which figures in `localities.json` each source anchors.
- **`MODEL.md`** — the model, in full and honestly: every formula, every
  parameter with its tier, the ward household allocation and its conservation
  assumption, the animal and visit rates, the price ladder, the affluence
  modifier, the seasonality index, the hour curve, the weekday split, the cost
  base, the serviceable ceiling and the limitations. State plainly which
  numbers would not survive a challenge and which would.
- **`ANALYSIS.md`** — the zone narrative: where the demand actually sits, the
  strongest localities and why, the weakest and why, the route clusters, the
  hour and weekday shape, the seasonality, the competitive picture, and what
  would change the verdict. Numbers, not adjectives.

## Order of work

1. Fix `build_localities.py` and regenerate `localities.json`.
2. Run the sanity bands and print the results.
3. Write `SOURCES.md`, `MODEL.md` and `ANALYSIS.md`.
4. Leave `_work/` in place.

## Output

In the final message report: the zone household total, the cases a month total,
the GO, HOLD and NO-GO counts, the top five localities by our-mix monthly
revenue with their figures, and the result of every sanity band. If a band
failed and you could not fix it, say so plainly and name the band.
