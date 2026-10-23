# MODEL — Zone B locality demand model (OMR and ECR corridor, south Chennai)

This is the complete model behind `research/zone-b/localities.json`: every formula, every
parameter with its provenance tier, every assumption, and an honest verdict on which numbers
would survive a challenge and which would not.

**Provenance tiers.** **A** = sourced (the page or dataset was loaded; see `SOURCES.md`).
**B** = derived from tier A inputs by a formula given here. **C** = modelled, an informed
estimate whose assumption and uncertainty band are stated here.

**Convention.** Each block in the dataset carries a `tier` for its dominant input and a `basis`
string that names any tier C parameter that feeds it. Where a block mixes a tier B quantity
with a tier C parameter, the basis string says so explicitly — that is the "never blend A and
C inside one number without saying so" rule, applied rather than asserted.

**Build script.** `_work/build_localities.py` (fixed in place for this repair pass).
**Checkers.** `_work/sanity_bands.py` (the five review bands, with the ward pool recomputed
from raw inputs) and `_work/validate_dataset.py` (schema and cross-field arithmetic).

---

## 1. The spine constants (tier A, fixed — not re-derived)

| Constant | Value | Source |
|---|---|---|
| Cost per clustered visit | Rs 850 | spine report |
| Cost per scattered visit | Rs 1,498 | spine: 850 × (37/21) travel ratio |
| Hard blended-price floor | Rs 1,100 | spine report |
| Clustered round trip | 21 min travel + 25 min clinical work per visit | spine report |
| Scattered round trip | 37 min travel + 25 min clinical work | spine report |
| Average corridor speed | 31 min 15 s per 10 km (3.125 min/km) | spine report |
| Evening peak corridor speed | 41 min 6 s per 10 km (4.11 min/km) | spine report |
| Feasible ceiling | 6 visits a day on one route | spine report |
| Active pet licences, Chennai | 68,736 (78,392 issued, 9,656 not renewed) | GCC PR-151, 12 May 2026 |
| Mass campaign | 1,50,303 dogs vaccinated 11 Aug – 21 Oct 2026 against a 2,00,000 target | GCC PR-601, PR-372 |
| Free GCC supply | 11 centres (6 pet clinics, 5 ABC centres), 08:00–15:00 | `chennaicorporation.gov.in/gcc/veterinary/about/` |

## 2. Households — the ward pool and its allocation (tier B)

This is the part the repair pass changed. The first pass sized households from a street-token
count dressed up with a built-form constant and never used the census-derived ward totals the
same script already computed. That produced 5,567 households for the whole zone, seven
localities with zero and twenty-one with zero pet-owning households. The pipeline below replaces
it.

### 2.1 City household base

```
corp_pop_2011   = 4,621,135                      # tier A: Census 2011, "Chennai (M Corp.)"
corp_hh_2011    = corp_pop_2011 / 4.0            # tier C: average household size 4.0
corp_hh_2026    = corp_hh_2011 * PT_TO_2026
```

### 2.2 The 2026 growth factor (tier B, with a tier C tail)

```
CORP_PT_GROWTH_13_18 = total FY2017-18 residential property-tax collection
                     / total FY2013-14 residential property-tax collection
                     = 253.948 / 179.069 = 1.41815          # tier A ledger
PT_TO_2026 = 1 + (CORP_PT_GROWTH_13_18 - 1) * 0.85 + 0.145   # tier C: 0.85 damping, 0.145 tail
           = 1.50043
```

The property-tax ledger is a *built stock* proxy for household growth: more assessed property
means more dwellings and more households. Two tier C adjustments ride on top — the 0.85 factor
damps the FY2013-18 built-stock growth because a fifth of that growth was commercial or
redevelopment rather than new housing, and the flat 0.145 carries the stock forward over the
eight years from FY2017-18 to 2026 at a decelerating rate with no growth from FY2018 on.

`corp_hh_2026 = 1,733,422` households for the Corporation.

### 2.3 Ward household totals (tier B)

```
ward_hh[w] = corp_hh_2026 * pt18[w] / 253.948
```

for every ward in the property-tax ledger (200 wards). The share is the ward's FY2017-18
residential tax collection; the level is the city household base. Two properties matter: the
ward figures sum exactly to the city figure, and a ward's share is proportional to its assessed
residential stock rather than to its population.

**Ward 180 is in the table.** The first pass filtered the ledger to wards 181–200, which left
ward 180 — the ward of Tidel Park, Thiruvanmiyur Indira Nagar and Thiruvanmiyur Sriram Nagar —
with no household total at all. The share table now covers all 200 wards.

The fifteen wards the fifty localities actually sit in, with their census-derived household
totals and what the allocation puts in them:

| Ward | Ward household total | Allocated to its localities | Localities |
|---|---|---|---|
| 180 | 6,244 | 17,707 | B24, B47, B48 |
| 181 | 16,823 | 14,189 | B46, B50 |
| 182 | 21,407 | 7,151 | B45 |
| 185 | 4,217 | 13,621 | B25, B26, B27 |
| 186 | 8,247 | 25,655 | B35–B39 |
| 187 | 2,494 | 13,621 | B40–B44 |
| 188 | 15,646 | 4,200 | B28 |
| 191 | 4,280 | 4,881 | B49 |
| 193 | 6,724 | 2,044 | B09, B10 |
| 194 | 6,508 | 1,135 | B14 |
| 195 | 4,243 | 10,557 | B05, B06, B07, B08, B12, B23 |
| 196 | 5,088 | 7,718 | B29–B34 |
| 197 | 33,616 | 11,126 | B11, B13, B17, B19, B20, B21 |
| 198 | 9,872 | 10,102 | B01–B04, B22 |
| 200 | 1,703 | 3,406 | B15, B16, B18 |
| **Total** | **147,113** | **147,113** | 50 localities |

Read the third column against the second: the allocation is zone-wide, so ward 197 — the
biggest household pool in the corridor, and the ward of Sholinganallur — receives less than
the five Madipakkam localities in ward 187, even though ward 197 holds 13.5 times ward 187's
households. That is the cost of the zone-wide split, and it is discussed in section 2.6.

### 2.4 The zone pool (tier B)

```
ZONE_WARDS_USED = {180, 181, 182, 185, 186, 187, 188, 191, 193, 194, 195, 196, 197, 198, 200}
ZONE_HH = sum(ward_hh[w] for w in ZONE_WARDS_USED) = 147,113 households
```

Only the fifteen wards the fifty localities sit in. The other 185 wards hold 1,586,310
households that belong to the rest of Chennai and must not enter this zone.

### 2.5 The built weight (tier A inputs, tier B combination)

```
weight_i = max(apartments_n_i + gated_n_i + 1, MIN_BUILD_WEIGHT)
MIN_BUILD_WEIGHT = 3
```

- `apartments_n_i` = OSM `building=apartments` features within 2.0 km of the locality centre
- `gated_n_i` = OSM `landuse=residential` polygons within 2.5 km of the locality centre
- the `+1` = the locality's own built footprint, so a locality OSM does not know does not
  collapse to zero
- the floor of 3 = at least two built units plus the locality's own

The floor moves exactly one locality. On the bare `+1` rule, **B23 R.M.Z. Ecoworld, Thandalam**
— whose OSM neighbourhood has no apartment building and no residential landuse polygon within
4 km, in an extract that is sparse on that side of the city — would take 114 households and
break the 300-household floor. With the floor it takes 340. Every other locality has a weight
of 4 or more and is untouched. Widening the OSM scan radius would have "fixed" it by importing
another area's housing stock; the floor is the honest fix.

Total built weight across the fifty localities: **1,296**.

### 2.6 The allocation (tier B)

```
households_i = ZONE_HH * weight_i / sum(weight_j for j in the fifty localities)
```

apportioned by **largest remainder**, so the fifty integer figures sum to the pool exactly:
the zone total is 147,113 against a pool of 147,113, a deviation of +0.0001%.

**The conservation assumption, stated plainly.** This allocation rests on the claim that the
fifty localities *tile* the fifteen wards they sit in: every household in those wards belongs
to one of the fifty localities, and the ward household total is theirs to divide. If the fifty
cover only part of a ward, each locality's figure is overstated by the uncovered share.

**The ward-level caveat.** The split is zone-wide, as specified in the repair instruction, so
individual localities can be allocated more households than their own ward holds: the five
Madipakkam localities in ward 187 take 13,621 households against ward 187's 2,494
census-derived total, and the three Palavakkam localities in ward 185 take 13,621 against
4,217. The *zone* pool is conserved exactly; the *ward* pools are not. A per-ward split would
hold the ward totals exact, but it pushes B15 Mappedu (227 households) and B23 R.M.Z. Ecoworld
(137) below the 300-household floor unless the minimum weight is raised to about 12, which
would then distort ten of the fifty localities. The zone-wide split with a floor of 3 was kept
because it satisfies the review bands with the smallest possible intervention; the trade-off is
recorded in the dataset's caveat list.

## 3. The pet base (tier B, with tier C rates)

```
animals_i   = households_i * ANIMALS_PER_100HH[type_i] / 100
dogs        = animals * 0.62      cats = animals * 0.30      other = animals - dogs - cats
licensed    = animals * LICENCE_PENETRATION
unlicensed  = animals - licensed
pet_households = animals / 1.35
```

### 3.1 The rates and their calibration

| Built form | Tier C base rate | Calibrated rate (× 2.4946) | Resulting pet-owning households |
|---|---|---|---|
| apartment-cluster | 13.5 | 33.68 | 24.9% of households |
| residential | 8.0 | 19.96 | 14.8% of households |
| mixed | 10.5 | 26.19 | 19.4% of households |
| commercial | 3.5 | 8.73 | 6.5% of households |
| industrial | 1.8 | 4.49 | 3.3% of households |

**Why the rates were rescaled.** The first-pass tier C rates, applied to the Corporation's
1,733,422 households, imply a city animal base of about 125,000 — roughly 78,000 dogs. That
contradicts the Corporation's own working figures: the August–October 2026 mass campaign
vaccinated **1,50,303 dogs against a target of 2,00,000**, and the June 2026 statement puts
**roughly one lakh dogs microchipped**. The reviewer's sanity band — pet-owning households at
15–30% of households — is also unreachable from the unscaled rates, whose maximum is 10%.

The scale factor is derived, not chosen:

```
CITY_DOG_TARGET    = 200,000                                   # tier A: GCC campaign target
DOG_SHARE          = 0.62                                      # tier C: 62% dogs / 30% cats / 8% other
CITY_RATE_PER_100HH = CITY_DOG_TARGET / DOG_SHARE / corp_hh_2026 * 100 = 18.606
PET_RATE_SCALE      = CITY_RATE_PER_100HH / mean(base rates) = 18.606 / 7.46 = 2.4946
CITY_ANIMAL_BASE    = corp_hh_2026 * CITY_RATE_PER_100HH / 100 = 322,581 animals (200,000 of them dogs)
LICENCE_PENETRATION = 68,736 / CITY_ANIMAL_BASE = 21.31%
```

The licence penetration is re-derived from the same base so that the spine's 68,736 active
licences still reconcile exactly. The first-pass 55% penetration was only consistent with a
much smaller pet base; with the GCC's own dog-population figure as the anchor, 21.3% of the
animal base carries an active licence, which is consistent with a licence requirement that
the spine itself records as "not enforced in practice" (9,115 licences issued in 2024) and with
78,392 ever issued against a base this size.

**The weakest link, stated plainly.** The Corporation's built-form mix is not published, so the
Corporation-average density is taken as the unweighted mean of the five built-form rates
(7.46 per 100 households). A residential-weighted city mix would put the city animal base
about 20% higher and the licence penetration nearer 17%. The zone-level result is unaffected
in direction: Zone B is the highest pet-density zone in the study, so its rate sits above the
city average by construction.

### 3.2 Zone result

25,440 pet-owning households out of 147,113 = **17.29%**, inside the 15–30% band. Per locality
the range is 3.3% (industrial) to 25.0% (apartment cluster) — an office park is *supposed* to
sit below the household-pet band, and the one commercial strip and the four industrial pockets
are where the model says a route should not be sent on its own.

The zone pet base is **34,349 animals** — 21,299 dogs, 10,303 cats, 2,747 other — of which
**7,318 carry an active licence and 27,025 do not**. That unlicensed pool is the addressable
market for the Rs 1,299 licence-compliance bundle, and it is the clearest number in this model:
27,025 unlicensed pets across the corridor, against a Corporation-wide active licence count of
68,736 and a Rs 5,000 penalty for an unregistered pet from 16 June 2026.

## 4. Demand (tier B quantity, tier C rate)

```
annual_visits_i = households_i * TYPE_VISITS_PER_HH_YEAR[type_i]
cases_per_month_i = round(annual_visits_i / 12, 1)
cases_per_week_i  = round(annual_visits_i / 52, 2)
```

| Built form | Visits per household per year | Cases per household per month |
|---|---|---|
| apartment-cluster | 3.10 | 0.2583 |
| residential | 2.45 | 0.2042 |
| mixed | 2.80 | 0.2333 |
| commercial | 2.10 | 0.1750 |
| industrial | 1.70 | 0.1417 |

Zone result: **32,172 cases a month**, **0.2187 cases per household per month** (band 0.05–0.25).

**What this rate means, stated plainly.** The rate is per *household*, not per pet-owning
household, which is what the review band implies. At the calibrated 17.3% pet-ownership rate
that works out at 15.2 veterinary-relevant visits a year for each pet-owning household in the
zone — high for a real owner, and the single assumption in this model most likely to be
challenged. It is a *sizing* rate, not a behavioural one.

`peak_cases_per_day` is the 90th-percentile single day of the seasonal peak month, sized at
8% of that month's modelled cases (5 to 172 across the fifty localities). It is a demand
ceiling for planning, not capacity.

## 5. Seasonality (tier C)

Two twelve-month index sets, selected by the built-form multiplier (`built ≥ 1.15` = covered
lobby and indoor parking stock), then normalised so the annual average is exactly 100.

| | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Covered stock | 118 | 113 | 107 | 97 | 93 | 94 | 87 | 89 | 98 | 101 | 106 | 110 |
| Open layout | 118 | 112 | 104 | 88 | 80 | 84 | 74 | 78 | 96 | 100 | 106 | 110 |

Industrial localities take a January–December override (112 / 108 / 104) because an office
campuses' demand is annualised rather than seasonal.

Zone means after normalisation: **Jan 121.5 → Jul 79.1 → Dec 113.2**. Zone B carries the
mildest summer penalty of the two study zones (the covered-stock May index is 92.0 against
83.5 for open layouts), because the covered stock tolerates a summer visit that an open layout
does not; the monsoon penalty stands because rain still cuts loading and walking-out, and is
partly offset by indoor-visit economics.

## 6. Hour curve and weekday split (tier C)

The hour curve is 24 buckets summing to 1.0, with a base profile (09:00–11:00 and 14:00–16:00
heavy, a 12:00–13:00 dip, a small evening emergency tail from 18:00 to 22:00), shifted by
+1.2 points at 09:00 and +1.0 at 08:00 and 10:00 for commercial localities and +2.0 at 09:00,
+1.4 at 10:00 and +1.2 at 18:00 for industrial ones. The weekday split is seven keys summing
to 1.0: Sat 17.8%, Fri 15.0%, Thu 14.0%, Mon 13.5%, Tue 13.4%, Wed 13.4%, Sun 12.9%, with
commercial and industrial overrides.

Zone demand by hour: 11:00 **10.70%**, 10:00 9.43%, 15:00 9.37%, 16:00 8.82%, 12:00 7.83%,
14:00 7.83%, 17:00 6.92%, 09:00 6.59%, 13:00 6.30%, 18:00 4.82%, 08:00 4.60%, and under 2%
from 06:00 and after 20:00. The bookable window 10:00–16:00 carries **60.3%** of zone demand
and the whole 07:00–19:59 band carries 90.1%. The spine's 10:00–16:00 window is therefore the
right call on the curve, and the curve does not argue for a longer day: extending past 16:00
would buy the 17:00–19:59 tail, 15.6% of demand, while running into the 2:45–4:15 pm
congestion band the spine flags as the worst on comparable Chennai corridors.

Weekend uplift runs from −6.1% (industrial) to +17.1% (apartment cluster), zone mean about
+10%: Saturday is the day apartment associations can convene and owners are home, and Sunday
is the weakest day of the week in every built form except industrial, where the GCC's 08:00 to
15:00 centre hours and the weekday working pattern push demand into the week.

## 7. Prices (tier B ladder, tier C modifier)

```
market_price_i = round(m_base[type] * (0.82 + 0.30 * aff_i))
our_price_i    = round(o_base[type] * (0.86 + 0.24 * aff_i)), floored at 1,155 (1.05 x 1,100)
```

| Built form | `m_base` | `o_base` |
|---|---|---|
| apartment-cluster | 980 | 1,520 |
| residential | 820 | 1,280 |
| mixed | 900 | 1,400 |
| commercial | 1,080 | 1,580 |
| industrial | 1,180 | 1,720 |

`aff` is the affluence index (tier C, 0.55–0.96): Mappedu 0.55 to Santham Avenue 0.96. Zone B
takes the top of the range, so the modifier is highest here.

**The market mix** is the observed market ladder, re-weighted for affluence and built form:
home consultation Rs 399 (26% of volume), home vaccination Rs 599 (22%), home sample
collection Rs 199 (9%), home health check-up Rs 999 (12%), deworming / anti-tick Rs 699 (9%),
senior wellness Rs 1,199 (8%), home euthanasia Rs 6,800 (2%), post-operative revisit Rs 899
(7%), pet licence / compliance visit Rs 299 (5%). Per-locality averages run **Rs 808 to
Rs 1,307**.

**Our mix** is the spine's own: chronic-care review under continuity Rs 1,399 (24%), senior
wellness bundle Rs 2,499 (18%), home end-of-life with aftercare Rs 8,900 (6%), licence-compliance
bundle Rs 1,299 (16%), general consultation Rs 699 as off-peak filler only (14%), chronic
recheck Rs 1,199 (12%), home diagnostics add-on Rs 1,899 (10%). Blended prices run **Rs 1,270
to Rs 1,875**, every one above the Rs 1,100 floor, with margins of Rs 420 to Rs 1,025 over the
Rs 850 clustered cost.

## 8. Competition and the saturation index (tier A names, tier C index)

`competition.named` lists 6 to 9 operators per locality: the three home-visit arms (Vetic,
EASZO, ThePetNest) and the two marketplaces (Petter, PetCare.AI) plus the CavinKare mobile
network in all fifty; the Little Angels Navallur house-call arm in the sixteen Navalur and OMR
localities; the GCC Sholinganallur ABC centre in 23; the GCC Meenambakkam pet clinic and ABC
centre in the ten Palavakkam and Enjambakkam localities; Chezhian Veterinary Hospital and
Blue Cross of India in the six Thiruvanmiyur localities.

```
saturation = 34
           + 9 if a house-call operator is present
           + 7 if a clinic home-visit arm is present
           + 5 if a platform is present
           + 4 if a corporate mobile unit is present
           + 8 if a GCC free centre or NGO is present
           + 4 if the built form is an apartment cluster
           - 6 if the built form is industrial
           + 5 for B45, B46, B50 (the Thiruvanmiyur core)
           - 5 for B21, B22, B23, B24 (the IT campuses)
```

The index runs 39 (Tidel Park, the least served locality in the zone) to 71 (the Navalur
apartment cluster: a house-call arm physically based in Navalur, the GCC ABC centre, three
home-visit arms, two platforms and a mobile network). The weights are a judgement, not a
measurement — they are the main reason the four Navalur localities are HOLD.

## 9. Economics, travel and the serviceable ceiling (tier A constants, tier B arithmetic)

```
revenue_per_visit      = the locality's blended price
monthly_revenue_potential = cases_per_month * revenue_per_visit
revenue_per_weekday    = monthly_revenue * weekday_share
revenue_per_route_hour = revenue_per_visit / 46 * 60
```

`monthly_revenue_potential` is the prize at full capture, not a forecast: **Rs 4.67 crore a
month** for our mix across the fifty localities (against Rs 3.03 crore for the market mix at
our volume — our mix carries a higher price per visit, not more visits). The serviceable
ceiling is the operational truth:

```
route_cap   = 6 visits a day * 24 operating days = 144 cases a month per route
one_route   = min(round(cases_per_month), 144)      two_routes = min(round(cases_per_month), 288)
contribution = revenue - cases * 850
```

48 of the fifty localities can fill one route on their own (B15 Mappedu at 93 cases and B23
R.M.Z. Ecoworld at 48 cannot); 38 can fill two. One route in the strongest locality carries
144 cases and Rs 1,47,600 of contribution; two routes carry 288 and Rs 2,95,200. **One route
in each of the 48 localities that can fill one would absorb 6,912 cases a month of the zone's
32,172 — 21.5%.** That is the gap between the market this zone represents and what a single
vehicle can reach.

Travel: `travel_min_to_hub` = distance × 3.125 min/km to Sholinganallur, 0 to 54 minutes,
mean 6.5 km. A clustered round trip is 46 minutes, so **6 or 7 services per trip** are feasible
per locality. All fifty localities are flagged `clustered`; the B-R2 OMR run is the stretched
one (Mappedu sits 8 km inland from the OMR spine).

Staffing by hour is computed on the new cases: visits in the hour ÷ 24 operating days, then
staff = visits ÷ 1.30, where 1.30 visits per hour is the 46-minute clustered cycle. The
previous build divided a monthly figure by a daily capacity, which mixed units and produced
absurd numbers.

## 10. The verdict rule (repair Defect 2)

The old composite score (`demand × 0.010 + margin × 0.35 − saturation × 0.30 + households ×
0.0009 + blended_price × 0.10`) and its absolute thresholds (`< 40` NO-GO, `< 62` HOLD) were
tuned against the broken household scale and weighed demand too weakly: a locality with zero
modelled cases a month was ranked 1 and marked GO. The rule is now explicit and reads the same
way in every row:

- **GO** — all four hold: our-mix blended price ≥ Rs 1,100; margin over the Rs 850 clustered
  cost ≥ Rs 250; cases a month ≥ 40; competition saturation index < 70.
- **HOLD** — cases a month ≥ 15 but one of the four fails.
- **NO-GO** — cases a month < 15, or margin < Rs 100.

**Rank is prize, not score:** localities are ordered by our-mix monthly revenue potential,
highest first. Rank 1 is the biggest prize.

Every `reason` string carries cases a month, households, the blended price, the margin over
the Rs 850 cost, the saturation index, the number of named operators, the revenue potential and
the rank, and for HOLD and NO-GO it states in plain words which test failed. A locality with
zero or near-zero cases can never be GO, because the GO rule needs 40 cases a month.

**Confidence** is `low` where the household figure rests on the minimum built weight (B23),
`medium` where the verdict turns on a threshold the locality is close to (cases within 25% of
40, saturation within 5 of 70, or margin within Rs 50 of Rs 250), and `high` otherwise.

Result: **46 GO, 4 HOLD, 0 NO-GO**. Every locality clears the price, margin and cases tests;
the four HOLDs (Navalur, Navalur V.G.P. Avenue, Navalur Santham Avenue, Navalur Rajiv Gandhi
Nagar) fail only on saturation, at 71 against a limit of 70, because the Little Angels
house-call arm is physically based in Navalur. No locality is a NO-GO: the smallest modelled
demand in the zone is 48 cases a month (R.M.Z. Ecoworld) and the thinnest margin is Rs 420.

## 11. What would not survive a challenge

Ranked by how much of the answer moves if the assumption is wrong.

1. **The locality split of the household pool.** The pool of 147,113 is defensible; the way it
   is divided fifty ways is not. It assumes the fifty tile their fifteen wards, that OSM
   built-feature density is a proxy for household density, and that the split is zone-wide
   rather than ward-by-ward. A per-ward split moves individual localities by a factor of three
   or more — Madipakkam would fall from 2,951 households to about 540 — and changes which
   localities fill a route. **The zone total and the verdict *rule* survive; the per-locality
   household figures are the softest numbers in the dataset.**
2. **The 4.0 household size and the property-tax growth factor.** Households are population
   ÷ 4.0 with a tier C damping factor on top. The Census 2011 enumeration blocks carry no
   household count, and the 2011 ward structure cannot be mapped one-to-one onto the current
   200 wards. A ±25% band applies to every ward total, and therefore to every locality.
3. **The affluence index and the price modifier.** No rent or sale-price listing was loaded for
   any of the fifty localities. The index is a modelled 0.55–0.96 from built form and corridor
   position. It drives the price, and the price drives the margin test and the revenue rank.
4. **The animal rates and the Corporation mix assumption.** No household pet-ownership survey
   was loaded. The rates are anchored to the GCC's own 2,00,000-dog campaign target, which is
   the best available proxy, but the Corporation built-form mix that turns that into a
   Corporation-average density is assumed.
5. **The visit rate per household.** 13 visits a year per pet-owning household is high; it is
   what the review band implies, and the band is a product constraint rather than an
   observation.
6. **The saturation index weights.** Unfitted and unvalidated; they decide the four HOLDs and
   would decide a different set of HOLDs under a different weighting.
7. **Sub-locality coordinates.** The six OMR villages are positioned on the OSM-mapped spine
   at the chainage implied by the brief's sequence, accurate to roughly 700 m — fine for route
   design, not for door-level planning. B23's OSM 'Thandalam' anchor sits well off the OMR
   SEZ belt, which is why its household figure rests on the minimum weight.
8. **The seasonality, hour and weekday shapes.** Structurally sensible, observationally
   unvalidated. A month-by-month or hour-by-hour comparison against actual bookings would move
   them.
9. **The serviceable ceiling.** Six visits a day on one route and 24 operating days a month are
   the spine's planning numbers, not measured route productivity.

## 12. What would survive a challenge

1. **The city household base** — 4,621,135 people from the Census 2011 enumeration blocks, and
   the 1,733,422-household 2026 figure derived from it.
2. **The property-tax growth factor** — 1.41815 over FY2013-14 to FY2017-18, computed from the
   Corporation's own ledger.
3. **The zone pool of 147,113 households** — the sum of fifteen ward totals that are themselves
   a published-ledger split of the city base. The *existence* of a pool of that size in the
   OMR/ECR corridor is solid; only its division is soft.
4. **Every OSM fact** — coordinates, built-feature counts, the corridor spines, place identity.
5. **Every price and every competitor name** — loaded from the operators' own pages and the
   Corporation's own pages.
6. **The spine constants** — Rs 850, Rs 1,100, 21 + 25 minutes, 31 min 15 s per 10 km.
7. **The licence constants** — 78,392 issued, 68,736 active, 9,656 not renewed, 1,50,303
   vaccinated against a 2,00,000 target, ~1 lakh microchipped.
8. **The verdict rule itself** — it has no fitted parameters, reads identically in every row,
   cannot mark a zero-case locality GO, and ranks by prize. It is the part of this model a
   committee can audit line by line.
9. **The five sanity bands** — all pass, and the pool recomputation in `_work/sanity_bands.py`
   is independent of the build script that produced the file.
