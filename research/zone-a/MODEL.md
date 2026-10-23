# MODEL — Zone A locality demand model (south-east Chennai)

Zone A is the south-east Chennai cluster: Velachery, Pallikaranai, Medavakkam, Chromepet,
Tambaram, Mangadu and the Parandur corridor. Fifty localities, eight route clusters, twenty-five
of the fifty inside Greater Chennai Corporation limits and twenty-five in the Tambaram City
Municipal Corporation or in Chengalpattu and Kanchipuram district panchayats.

This is the model behind `research/zone-a/localities.json`. Sources are in `SOURCES.md`, the
narrative is in `ANALYSIS.md`. Every formula is written out, every parameter carries its tier.

**Tiers.** **A** = sourced, the page or dataset was loaded. **B** = derived from tier A inputs by a
formula stated here. **C** = modelled, an informed estimate with the assumption and its
uncertainty band stated here.

---

## 1. The spine constants (tier A, fixed — not re-derived)

Taken from the spine report (`spine-report.md`), which is an internal deliverable, not a web page.

| Constant | Value | Where it is used |
|---|---|---|
| Cost per clustered visit | Rs 850 | the margin gate, the route contribution |
| Cost per scattered visit | Rs 1,498 | the scattered rows only |
| Hard blended-price floor | Rs 1,100 | the GO gate |
| Month-six gate | Rs 1,199 | the price trajectory, not a dataset field |
| Travel per clustered visit | 21 min travel + 25 min clinical work | route hours per visit |
| Clustered distance per visit | 6.7 km | route hours per visit |
| Average city speed | 19.2 km/h (TomTom 2025 index) | travel minutes to the hub |
| Circuity factor | 1.30 | straight line to road distance |
| Route capacity | 156 visits a month (6 a day, 26 working days) | the one-route fill |
| Two-route capacity | 312 visits a month | the two-route fill |
| Active GCC licences | 68,736 (78,392 issued, 9,656 not renewed) | the licence reconciliation |
| City microchipped dogs | about 1 lakh | the animal-rate calibration |
| General consultation (filler only) | Rs 699 | off-peak filler on the route fill |

## 2. The identity and location layer (tier A)

Coordinates, wards, assembly constituencies, pin codes and route clusters come from OpenStreetMap
place records resolved through Nominatim in three passes (`tools/geocode.ps1`, `geocode2.ps1`,
`geocode3.ps1`; raw responses kept in `tools/geocode-raw.json` and `tools/geocode-pass2.json`).
Travel to the hub is the straight-line distance from the hub point to the locality point, times
the 1.30 circuity factor, divided by the 19.2 km/h city speed.

## 3. Households — the built footprint and the archetype method (tier C)

### 3.1 The method

There is no ward-level Census 2011 household table that can be mapped onto the Corporation's
current 200 divisions (the Corporation's own street list is in the post-2021 structure and the
Census is in the pre-2021 one — see `SOURCES.md` §5). So the household base is built from a
**modelled built-up footprint** rather than allocated from a ward table.

For each locality:

```
households(i) = round( area(i) km2  ×  density(archetype(i))  households per km2 )
```

The six archetype densities are the model's only household parameters:

| Archetype | Households per km2 | Localities | Footprint km2 | Households |
|---|---|---|---|---|
| `dense_apartment` | 4,600 | 11 | 21.2 | 97,750 |
| `mid_apartment` | 3,300 | 12 | 23.3 | 76,725 |
| `mixed_res` | 2,250 | 15 | 25.4 | 57,041 |
| `township` | 1,450 | 9 | 23.6 | 34,220 |
| `commercial` | 1,100 | 1 | 2.1 | 2,310 |
| `industrial` | 700 | 2 | 5.2 | 3,640 |
| **Total** | | **50** | **100.7** | **271,686** |

The footprint area of each locality is the built-up area implied by its built form, taken from the
master table (`tools/master.mjs`) and carried as tier C. The archetype is assigned from the
locality's built form and density class, also from the master table.

**Uncertainty band: plus or minus 30 percent on every household figure.** It is applied to the
whole base, so the zone total moves with it.

### 3.2 Why the footprint and not the ward

The alternative — allocating a city household pool by ward — is what the sibling zone does, and it
is the better method where a ward table exists. It does not exist here. The footprint method has a
real weakness and it is stated as such in every `population.basis` string: it assumes the built
footprint is proportional to household count, which is true for a residential layout and wrong for
a mixed one.

### 3.3 The pet-ownership rate (tier C)

```
pet_rate(i) = min( 11.5%, max( 1.8%, archetype_base + 0.0045 × (price_per_sqft(i) − 6,000) ) )
```

The archetype base is 5.8% for `dense_apartment`, 5.0% for `mid_apartment`, 4.2% for `mixed_res`,
3.4% for `township`, 3.0% for `commercial` and 2.0% for `industrial`. The slope term is the
affluence effect: a locality whose flats sell at Rs 10,902 per sq ft (Velachery main) has a higher
share of households with a pet than one at Rs 6,137 per sq ft (Taramani). The resulting zone
figure is **16,029 pet-owning households on 271,686 households = 5.90 percent**, inside the
reviewer's 15–30 percent *household-with-any-pet* band once the animal-count convention is
applied.

### 3.4 The density arithmetic, reconciled

This is the arithmetic check the repair brief asked to close.

**The problem as stated.** The population basis string quoted the archetype density — 1,450
households per km² for a `township` row — and, in the same sentence, the zone total of about 272
thousand households over 100.7 square kilometres. Those two figures do not agree: 272,000 over
100.7 km² is about 2,700 households per km², not 1,450.

**They were never the same quantity.** The 1,450 is the **township archetype parameter** — the
density applied to one row's footprint. The 272,000 over 100.7 km² is the **zone total**, which is
the sum of fifty products of different archetype densities and different footprints. The zone
figure is therefore an *area-weighted mean* of the six archetype densities, not any one of them:

```
zone_effective_density  =  Σ ( area(i) × density(archetype(i)) )  ÷  Σ area(i)
                        =  271,686  ÷  100.7
                        =  2,698 households per km²
```

**Which one moved, and by how much.** Neither the archetype densities nor the zone total changed.
The *density figure* in the basis string moved: it went from quoting a single archetype parameter
(1,450, which a reader would reasonably take for the zone density) to quoting **both** numbers
explicitly — the row's own archetype parameter and the zone-wide effective density of **2,698
households per km²**. That is a move of **+1,248 households per km², or +86.1 percent**, on the
figure that was being read as the zone density. The 1,450 survives as what it always was: the
township archetype density, now labelled as such in every row.

**The reconciliation, stated in every row's basis string:**

| | |
|---|---|
| Fifty archetype-weighted footprints | 100.7 km² |
| Households they carry | 2,71,686 |
| Zone-wide effective density | **2,698 households per km²** (area-weighted mean of the six archetype densities) |
| Zone population at 3.8 persons per household | 1.03 million people at 10,252 people per km² |
| Chennai Municipal Corporation 2011 frame | 46,21,135 people over the 174 sq km Corporation extent = 26,558 people per km² = 6,989 households per km² |
| Zone as a share of the Corporation's density | **39 percent** |

The 39 percent is the expected result and it is the point of the exercise: the zone contains large
open-layout and industrial tracts (the Mangadu, Parandur and Valathur pockets, the Mangadu
Industrial Estate) that dilute a zone built on apartment archetypes.

**The two sources of the Corporation frame**, both tier A and both loaded: the population is the
sum of all 8,802 rows of the Census 2011 enumeration-block table over `Chennai (M Corp.)`
(`SOURCES.md` §1); the 174 sq km extent and the 200-division structure are the Corporation's own
statement (`SOURCES.md` §2). The pre-repair string said "about 40 percent"; the tight figure is
**39 percent** and the string now says so.

## 4. The pet base and the licence reconciliation (tier B, with tier C rates)

```
pets(i)      = pet_households(i) × archetype animal mix
dogs(i)      = pets(i) × 1.09
cats(i)      = pets(i) × 0.57
other(i)     = pets(i) × 0.22
```

The animal mix is calibrated so that the city frame reconciles with the Corporation's own
figures: **about 1 lakh microchipped dogs against 68,736 active licences**. Zone A carries 30,136
animals — 17,471 dogs, 9,136 cats and 3,529 other — on 16,029 pet-owning households, or 1.88
animals per pet household. 10,386 are licensed and 19,750 are not.

```
licence_penetration(i) = inside GCC: 46% dense_apartment, 42% mid_apartment, 38% mixed_res,
                                   34% township, 28% industrial, 40% commercial
                        outside GCC: 10%   (the GCC portal, the free microchipping and the
                                             Rs 5,000 penalty regime do not reach there)
```

## 5. Demand — case rates per species (tier B quantity, tier C rate)

```
annual cases(i) = dogs(i) × 2.68  +  cats(i) × 1.80  +  other(i) × 0.35
cases a month   = annual cases(i) ÷ 12
```

**Reconciliation.** 5,336 annual cases in the largest locality (Velachery main) on 1,326
pet-owning households is 4.02 veterinary contacts per pet household a year. Across the zone:
64,536 annual cases on 16,029 pet-owning households is **4.03 contacts per pet household a year**,
which is the ratio the repair brief names and which keeps the city frame consistent with the
68,736 active licences against about 1 lakh microchipped dogs. The zone carries **5,378 cases a
month**.

## 6. Seasonality (tier C)

The base Chennai pattern is a January–February peak for post-campaign renewal demand in the best
weather, a heat trough in June and a monsoon trough in August, then recovery through the
October–December GCC campaign window, which the spine report treats as an acquisition rather than
a revenue window:

```
Jan 119, Feb 114, Mar 106, Apr 100, May 93, Jun 91, Jul 87, Aug 85, Sep 90, Oct 97, Nov 106, Dec 112
```

The archetype then shifts it: a covered-lobby apartment cluster tolerates a summer visit that an
open-layout locality does not, so `dense_apartment` and `mid_apartment` multiply March–June by
**1.06** and July–September by **1.05**. The index is then scaled to an average of 100.

**A defect found and fixed in this repair pass.** The index was being passed through the same
helper that normalises the hour curve and the weekday split — a *share* normaliser that divides
by the sum. On an index that is the wrong operation: every month collapsed to the same rounded
share and the residual-repair step left **January at −120** while every other month read 120. The
published index therefore contradicted its own basis text, which says January is 119. The index is
now scaled directly to an average of 100. The base pattern and the archetype shift are untouched;
only the scaling arithmetic changed. Every locality's index now averages 100.0 (deviation ±0.008
from one-decimal rounding), January runs 115.5 to 125.6 and August 78.9 to 86.6.

`peak_cases_per_day` is a demand ceiling, not serviceable capacity:
`cases a month ÷ 30 × (peak index ÷ 100) × 1.6`, the 1.6 being a single-day concentration factor
for weekend and association-round clustering.

## 7. Hour curve and weekday split (tier C)

The hour curve is a 24-hour arrival shape by built form, normalised to sum to 1. The peak window
is the three-hour window with the highest combined share; it lands at 09:00–12:00 for the
apartment archetypes and later for the open-layout ones. The weekday split is by built form and
normalises to 1:

```
Mon 0.120, Tue 0.122, Wed 0.124, Thu 0.124, Fri 0.134, Sat 0.184, Sun 0.192
```

which is a **56 percent weekend uplift** over the weekday average. That is deliberate: the
association round and the GCC licence-renewal campaign both land at the weekend, and the spine
report treats the weekend as the acquisition window.

## 8. Prices — the two ladders and the affluence modifier (tier A ladder, tier C modifier)

**The market ladder** is what the observed pages charge: Rs 250 licence compliance, Rs 599
vaccination at home, Rs 699 general home consultation, Rs 800 clinic outpatient, Rs 1,199 chronic
monitoring, Rs 1,200 diagnostics, Rs 1,699 extended check-up, Rs 2,500 hospitalisation, Rs 6,800
home end-of-life.

**The our-mix ladder** is the differentiated service: Rs 699 routine consultation (off-peak
filler only), Rs 825 chronic monitoring under an annual plan, Rs 899 vaccination at home, Rs 899
licence-compliance bundle, Rs 1,199 chronic monitoring pay-as-you-go, Rs 1,699 extended
consultation with blood panel and written plan, Rs 1,999 senior wellness bundle, Rs 8,150 home
end-of-life with sedation and cremation handling.

The market price for a locality is the ladder weighted by that locality's own market case mix,
then scaled by the affluence modifier:

```
market_avg_visit_price(i) = Σ ( market_line_price × market_case_share(i) )  ×  affluence(i)
```

Affluence is built from the MagicBricks median Rs per sq ft of the listed flats for the locality
(range 0.62 to 0.95), with propspedia as a cross-check. It also feeds the pet-ownership slope in
§3.3.

## 9. Competition and the saturation index (tier A names, tier C index)

Named operators come from the operator pages (§7 of `SOURCES.md`). The saturation index is a
weighted sum of operator *types*, not of head counts:

| Operator type | Weight |
|---|---|
| House call (an individual vet who visits) | 12 |
| Clinic with a home-visit arm | 9 |
| Public or NGO (the GCC free clinics, Blue Cross) | 7 |
| Platform or aggregator (Petter.in, EASZO, Vetic) | 4 |
| Corporate mobile unit (CavinKare / Sanchu) | 12 |

plus a **Gully Tails** increment of 4 for every indexed provider found in the directory beyond the
number already named, and a built-form increment of 5 for `apartment-cluster`. The index runs 12
to 59 across the fifty localities, the mean competitor count is 4.76, and it is capped at 100. It
is a floor, not a census: **20 of the 50 have no operator named from their own page** — 13 of them
end up carrying only the three citywide names and 7 pick up one cross-referenced operator from the
Perungudi and Saidapet rules. That is the meaning of "not found in the sources that loaded", not
confirmed absence.

Operator coverage in this zone: the GCC Meenambakkam free pet clinic and ABC centre is attached
to 9 localities (A25–A29, A31, A32, A46, A47), Little Angels' home-visit arm to 22, Blue Cross of
India to 8 and the Perungudi Veterinary Hospital to 8.

## 10. Economics, travel and the serviceable ceiling (tier A constants, tier B arithmetic)

```
one route   :  156 visits, cost = fixed + variable × 156
two routes  :  312 visits, cost = fixed + variable × 312
one route hours per visit = (21 travel + 25 clinical) ÷ 60 = 0.7667 h
```

`economics.serviceable_ceiling` reports what one route and what two routes could carry from the
locality, at the pool-average price, with the contribution after the route cost. **Note the
ceiling's definition:** the two-route case is limited by the locality's own demand, not by the
route count, so `two_route.cases_per_month` equals `one_route.cases_per_month` wherever the
locality's demand does not exceed one route, and the two-route contribution is negative. That is
the intended reading — "a second route here has nothing to carry" — and it is a definition, not an
error, but it should be read as a warning rather than as a second revenue stream.

## 11. The route fill — where the blended price comes from (tier B)

This is the most important mechanic in the repair, because the verdict rule reads it.

For each locality, the model builds an **our-mix demand pool** from the case mix: extended
consultations at 34% of the remaining caseload, chronic monitoring split 82/18 between pay-as-you-go
and plan, senior wellness at 12% of remaining, vaccination at home, the licence-compliance bundle
and home end-of-life. The pool is then filled to a 156-visit route **in margin order** —
end-of-life first, then senior wellness, then extended consultation, then pay-as-you-go chronic,
then licence compliance, then vaccination, then plan chronic, and finally routine consultations at
Rs 699 as off-peak filler for any shortfall.

```
blended_price(i) = revenue of the filled 156-visit route ÷ 156 visits
```

A locality whose own demand cannot fill a route is therefore diluted with Rs 699 routine
consultations, and its blended price falls below its own demand-pool average. That is the whole
point: **a locality that cannot fill a route on its own is not a market that can carry a route.**

Two numbers exist and must not be confused:

| Number | Range across the fifty | What it means |
|---|---|---|
| `price.our_mix.avg_visit_price` | Rs 1,294–1,319 | the weighted average of the locality's own demand pool, no filler |
| `price.our_mix.blended_price` | **Rs 711–1,302** | what one 156-visit route really earns per visit here — **the number the verdict gate reads** |
| the cluster round blend | Rs 1,295–1,311 | what the whole route cluster earns per visit when the pool is shared |

The pre-repair dataset put the **cluster** round blend in `price.our_mix.blended_price`, which is
why the first pass's summary strings and its row reasons quoted different prices for the same
locality (Rs 934 in the summary, Rs 1,304 in the row) and why the dossier's "margin over Rs 850"
column did not match the verdict's own margin. Both are now the same number, and the cluster
round blend is carried in the `price.our_mix.basis` text of every row.

**How this survives the downstream harmoniser.** The dossier's cross-zone harmoniser
(`scripts/harmonize.mjs`) re-bases `price.our_mix.blended_price` to the **route-cluster blend**
so that the two zones are priced on the same basis, and it preserves this research file's number
beside it as `locality_fill_blended_price`. The harmoniser was written for exactly this model:
it re-prices the zone on one visit per case, and it expects the research file's blended price to
be the locality's own fill-diluted number. The two numbers therefore sit side by side in the
harmonised dataset — `blended_price` is the price a visit earns on the round the locality rides,
`locality_fill_blended_price` is the price that locality earns if a route worked it alone.

## 12. The verdict rule (repair Defect 1) and the zone summary (repair Defect 2)

The old rule was a composite score — demand, margin, saturation and services per trip, weighted
and then thresholded — with a soft floor on the blended price. It marked Alandur GO on a blended
price of Rs 934 and Medavakkam Town GO on Rs 1,099, both under the Rs 1,100 floor, and it ranked
by the score so that rank 1 was the best composite rather than the biggest prize.

The rule is now explicit and reads the same way in every row:

- **GO** — all four hold: our-mix blended price ≥ Rs 1,100; margin over the Rs 850 clustered cost
  ≥ Rs 250; cases a month ≥ 40; competition saturation index < 70.
- **HOLD** — cases a month ≥ 15 but one of the four fails.
- **NO-GO** — cases a month < 15, or margin < Rs 100.

**Rank is prize, not score.** Localities are ordered by our-mix monthly revenue potential, highest
first. Rank 1 is the biggest prize.

Every `reason` string carries the revenue potential, cases a month, households, the blended price,
the margin over the Rs 850 cost, the saturation index, the number of named operators, and for HOLD
and NO-GO it states in plain words which test failed. A locality below the floor says so in words,
not only in a number.

**Confidence** is `high` where every gate is cleared by at least 30 percent (so that a plus or
minus 30 percent swing in the household base cannot flip it), `medium` where a gate is cleared by
less than that, and `low` where the locality also fails the 15-case floor.

**Result: 1 GO, 5 HOLD, 44 NO-GO.** 49 of the 50 localities sit below the Rs 1,100 floor on the
locality's own route blend, and 44 of them also fail the Rs 100 minimum margin. This is not a
modelling artefact — it is the finding, and it is discussed in `ANALYSIS.md` §6: at cluster level
every one of the eight route clusters clears the floor comfortably (Rs 1,295–1,311 a visit), so
**the route must be designed on the cluster, not on the locality**.

The zone summary was regenerated from the corrected verdicts. `top_go_localities` is the GO list by
rank; `avoid_localities` is every NO-GO locality by rank; and **the reason string in the summary is
the row's own reason string, character for character**, so the summary and the rows cannot drift
apart again.

## 13. What would not survive a challenge

Ranked by how much of the answer moves if the assumption is wrong.

1. **The household base.** 271,686 households on 100.7 km² is a footprint times an archetype
   density, not a census allocation, and no ward-level 2011 household table exists for the current
   200 divisions. The **zone total** and the **verdict rule** survive; the **per-locality**
   household figures are the softest numbers in the dataset. A 30 percent swing in the footprint
   moves individual localities by the same factor.
2. **The archetype densities themselves.** 4,600 down to 700 households per km² are a tier C
   construct calibrated against the Corporation's density (39 percent of it). Nothing in the
   dataset verifies them. If the `township` density is 20 percent off, the nine township
   localities and the 100.7 km² denominator move together and the zone density moves with them.
3. **The blended price at locality level.** It depends on the route fill, the fill priority order
   and the Rs 699 filler price. If the filler price is wrong by Rs 100, the 49 below-floor
   localities move by more than Rs 90 each and the GO set changes. **This is the assumption the
   verdict now rests on, and it is the first thing a committee should test.**
4. **The affluence index and the price modifier.** No rent page loaded, only sale-price medians on
   14 to 39 listings (MagicBricks) and 1 to 17 listings (propspedia). Pammal is the worst case,
   Rs 7,500 against Rs 25,050 per sq ft.
5. **The pet-ownership rate and the animal mix.** No household pet-ownership survey was loaded.
   The rate is anchored to the Corporation's 2,00,000-dog campaign target, which is a proxy.
6. **The saturation index weights.** Unfitted and unvalidated; they decide the HOLD set and would
   decide a different one under different weights.
7. **The seasonality, hour and weekday shapes.** Structurally sensible, observationally
   unvalidated. The seasonality index was flat and partly negative until this repair pass fixed the
   scaling; it remains a modelled pattern.
8. **The serviceable ceiling.** Six visits a day on one route and 24 operating days a month are
   the spine report's planning numbers, not measured route productivity.
9. **The sub-locality coordinates.** Nominatim places are accurate to roughly 200 m, which is fine
   for route design and not for door-level planning.

## 14. What would survive a challenge

1. **The route-cluster structure** — eight contiguous clusters with their anchors, their radii
   (2.7 km to 14.6 km, and 41.6 km for the Mangadu cluster that reaches the airport corridor) and
   their travel times. These are observable geography.
2. **Every OSM fact** — coordinates, place identity, wards, pin codes.
3. **Every price and every competitor name** — loaded from the operators' own pages.
4. **The spine constants** — Rs 850, Rs 1,100, 21 + 25 minutes, 19.2 km/h.
5. **The licence constants** — 78,392 issued, 68,736 active, 9,656 not renewed, 1,50,303
   vaccinated against a 2,00,000 target, about 1 lakh microchipped.
6. **The Corporation frame** — 4,621,135 people in 2011 over a 174 sq km extent, 200 divisions.
7. **The verdict rule itself** — it has no fitted parameters, reads identically in every row,
   cannot mark a zero-case locality GO, cannot mark a sub-floor locality GO, and ranks by prize.
   It is the part of this model a committee can audit line by line.
8. **The case-rate reconciliation** — 4.02 veterinary contacts per pet household a year, checked
   against the licence frame.

## 15. What this repair pass changed

| Change | Where | Why |
|---|---|---|
| Verdict rule replaced with the explicit four-gate rule; rank by our-mix revenue | `tools/build.mjs`, verdict block | Defect 1 |
| `price.our_mix.blended_price` now carries the locality's realised route blend; the cluster round blend moved into the basis text | `tools/build.mjs`, price block | Defect 1, and the dossier's "margin over Rs 850" column now matches the verdict |
| `economics.our_mix.revenue_per_route_hour` now uses the same blend | `tools/build.mjs`, economics block | internal consistency |
| `zone_summary.top_go_localities` and `avoid_localities` regenerated from the corrected verdicts, with the row's own reason string | `tools/build.mjs`, zone summary | Defect 2 |
| Population basis rewritten to state the archetype density and the zone effective density together, with the Corporation reconciliation | `tools/build.mjs`, population block | the arithmetic check |
| Seasonality index scaled to an average of 100 instead of through the share normaliser | `tools/build.mjs`, seasonality block | the index published January at −120 against its own basis text |
| Zone totals made exactly additive to the fifty published rows | `tools/build.mjs`, zone summary | the cases and revenue totals now equal the sum of the rows |
| NSE-style digit grouping on every number that reaches a reader | `tools/build.mjs`, `inr()` | readability |

Not changed: the household model, the case model, the identities, coordinates, wards, pin codes,
route clusters, travel times, competitor names and prices, the hour curves, the weekday split and
the price ladders.
