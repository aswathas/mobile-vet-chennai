# ANALYSIS — Zone B: OMR and ECR corridor, south Chennai

Zone narrative with the numbers behind it. Every figure here comes from
`research/zone-b/localities.json`; the model is in `MODEL.md`, the sources in `SOURCES.md`.

---

## 1. The headline

| | |
|---|---|
| Localities | 50 across 7 route clusters and 15 GCC wards |
| Households | **147,113** (pool of the 15 wards the localities sit in) |
| Pet-owning households | **25,440** (17.29% of households) |
| Animals | 34,349 — 21,299 dogs, 10,303 cats, 2,747 other |
| Licensed / unlicensed pets | 7,318 / **27,025** |
| Cases a month | **32,172** |
| Our-mix revenue potential | **Rs 4.67 crore a month** (market mix at the same volume: Rs 3.03 crore) |
| Verdicts | **46 GO, 4 HOLD, 0 NO-GO** |
| Hub | Sholinganallur (12.89354, 80.23206) — mean 6.5 km to the fifty localities |

## 2. Where the demand actually sits

Demand is not spread along the corridor; it piles into the southern third.

| Cluster | Anchor | Localities | Cases a month | Our Rs/month | Households | Saturation |
|---|---|---|---|---|---|---|
| B-R7 | Thiruvanmiyur | 6 | **8,543** | **1,21,68,461** | 38,366 | 58–63 |
| B-R5 | Perungudi | 5 | **5,663** | 79,02,509 | 25,655 | 50–54 |
| B-R4 | Palavakkam | 10 | 5,596 | 79,99,672 | 25,539 | 58–62 |
| B-R1 | Navalur | 8 | 3,833 | 57,43,100 | 16,573 | 67–71 |
| B-R6 | Madipakkam | 5 | 3,353 | 51,72,044 | 13,621 | 50–54 |
| B-R3 | Sholinganallur | 8 | 2,993 | 46,92,014 | 17,368 | 39–58 |
| B-R2 | Kandanchal | 8 | 2,192 | 30,22,086 | 9,991 | 67 |

**The Thiruvanmiyur cluster alone carries 26.6% of the zone's cases on 26.1% of its
households**, and the three southern clusters (Thiruvanmiyur, Perungudi, Palavakkam) carry
**61.6% of cases and 60.1% of revenue** on 60.9% of households. The northern OMR clusters —
Navalur, Kandanchal, Sholinganallur — carry 28.0% of cases on 29.9% of households despite
being half the zone's length.

Two forces explain the gradient, and both are measurable in the dataset:

1. **Built density.** The southern cluster centres carry 5–31 OSM apartment features and 14–38
   residential polygons within 2–2.5 km (Thiruvanmiyur: 17–31 and 20–34; Perungudi: 5–13 and
   32–38; Palavakkam: 7–22 and 14–35), while the OMR villages carry 0–5. The household
   allocation follows OSM built weight, so built density *is* the demand gradient.
2. **Affluence.** Thiruvanmiyur and Perungudi carry affluence indices of 0.58–0.88, and the
   five top-ranked localities sit at 0.64–0.88, which lifts their blended price to
   Rs 1,297–1,599 against Rs 1,270–1,456 in the OMR residential and village pockets. Demand
   and price multiply in the ranking: the top five localities by revenue are all in the two
   southern clusters, and every one of them prices between Rs 1,297 and Rs 1,599.

The corollary matters commercially: **the zone is not one market.** It is a high-value southern
cluster, a mid-value ECR apartment belt (Palavakkam, Enjambakkam, Sungudi), a mid-value
western apartment belt (Perungudi, Madipakkam) and a low-value northern industrial ribbon
(Thazhuthendur to Egumudi). One route design does not serve all four.

## 3. The strongest five, and why

| Rank | Locality | Cases/mo | Households | Our Rs/mo | Blended price | Margin | Sat | Ops | Status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Thiruvanmiyur V.O.C. Street | 1,748 | 7,492 | 25,87,188 | Rs 1,480 | Rs 630 | 63 | 8 | GO |
| 2 | Thiruvanmiyur | 1,669 | 7,151 | 25,02,900 | Rs 1,500 | Rs 650 | 63 | 8 | GO |
| 3 | Thiruvanmiyur Indira Nagar | 1,349 | 5,221 | 21,56,731 | Rs 1,599 | Rs 749 | 62 | 8 | GO |
| 4 | Perungudi Bethel Nagar | 1,349 | 5,222 | 21,36,816 | Rs 1,584 | Rs 734 | 54 | 6 | GO |
| 5 | Thiruvanmiyur Sriram Nagar | 1,414 | 6,924 | 18,33,569 | Rs 1,297 | Rs 447 | 58 | 8 | GO |

- **Thiruvanmiyur V.O.C. Street (rank 1)** has the highest modelled demand in the zone: 1,748
  cases a month from 7,492 households, with the highest OSM built weight (31 apartment
  features and 34 residential polygons). Its Rs 1,480 blended price clears the Rs 1,100 floor
  by Rs 380 and leaves a Rs 630 margin over the Rs 850 clustered cost. It is also on the Zone A
  seam — see section 10.
- **Thiruvanmiyur Indira Nagar (rank 3)** is the best price-quality combination in the zone:
  Rs 1,599 blended, Rs 749 margin, and only 8 named operators. An apartment-cluster built form
  at affluence 0.80 gets the 33.68 animals per 100 households rate, the highest pet density in
  the model, and 24.9% of its households own a pet.
- **Perungudi Bethel Nagar (rank 4)** is the strongest non-Thiruvanmiyur locality and the least
  saturated of the top five: saturation 54 with only 6 named operators, against 58–63 in the
  Thiruvanmiyur cluster. It is the highest-revenue locality where a private operator can set up
  without walking into an established local name on every street.
- **Thiruvanmiyur Sriram Nagar (rank 5)** earns its place on volume, not price: 1,414 cases a
  month at Rs 1,297 — the third-highest case count and the lowest price of the top ten. This is
  the volume/residential case — the right shape for a licence-compliance and chronic-care
  contract, the wrong shape for a premium wellness pitch.

**Tenth place is the one to watch: Tidel Park / Rajiv Gandhi IT Expressway**, Rs 14,77,312 a
month on 788 cases at the zone's highest blended price (Rs 1,875) and its lowest saturation
(39). It has the widest margin in the zone (Rs 1,025) and the least veterinary supply in the
zone — but it is an industrial built form with a 3.3% pet-ownership rate, it sits closest to
the Zone A seam, and its OSM 'Thandalam' anchor places it 17.2 km from the hub, the longest
travel in the dataset. It ranks on price and headroom, not on density.

## 4. The weakest and why

| Rank | Locality | Cases/mo | Households | Our Rs/mo | Sat | Status |
|---|---|---|---|---|---|---|
| 48 | Enjambakkam | 159 | 681 | 2,29,769 | 58 | GO |
| 49 | Mappedu | 93 | 454 | 1,17,729 | 67 | GO |
| 50 | R.M.Z. Ecoworld, Thandalam | 48 | 340 | 88,784 | 47 | GO |

- **R.M.Z. Ecoworld (rank 50)** is the weakest locality in the zone and the only one carried by
  the model's floor: its OSM neighbourhood has no apartment feature and no residential polygon
  within 4 km, so its built weight is the minimum of 3 and its household figure of 340 is the
  floor figure, not a measurement. With 48 cases a month it clears the 40-case GO test by 8
  cases; a 17% fall in its household allocation would drop it to HOLD. Its verdict is marked
  `confidence: low` and it should not be routed to on the strength of this model. Its price
  (Rs 1,842) and margin (Rs 992) are the second-highest in the zone, which is why it still
  reaches GO — and why that verdict is fragile.
- **Mappedu (rank 49)** has the second-smallest household base (454) and 93 cases a month. It
  is also the worst-connected locality on the OMR side: 8 km inland from the OMR spine, 10.3
  km from the hub, 32 minutes of travel each way. It has enough demand for one route every
  three weeks; it does not have enough to be a base.
- **Enjambakkam (rank 48)** has 159 cases from 681 households — the GCC pet clinic and ABC
  centre sits inside this pocket at B V Nagar, free, and its OSM built count is 0 apartment
  features and 5 residential polygons. That is the low-saturation-but-low-density case: the
  free centre suppresses price, the OSM count suppresses the household allocation.

**There is no NO-GO in the zone**, and that is a finding rather than a modelling artefact: the
smallest modelled demand is 48 cases a month and the thinnest margin is Rs 420, so neither
NO-GO condition (cases below 15, or margin below Rs 100) is triggered anywhere. The four
HOLDs are the only rows where a threshold binds.

## 5. The four HOLDs, and the single test that binds

**Navalur, Navalur V.G.P. Avenue, Navalur Santham Avenue and Navalur Rajiv Gandhi Nagar** are
HOLD at ranks 19–22, and they fail on one test only: **competition saturation index 71 against
a limit of 70**. Each has 528–557 cases a month, Rs 1,606–1,657 blended price and Rs 756–807
margins — all comfortably GO on price, margin and demand. The arithmetic is 34 base + 9 for
the Little Angels Navallur house-call arm + 7 for a clinic home-visit arm + 5 for a platform
+ 4 for a corporate mobile unit + 8 for the GCC Sholinganallur ABC centre + 4 for the
apartment-cluster built form = 71.

**Every other locality in the zone clears all four tests**, which is why 46 rows read GO. The
practical reading: the verdict rule is not discriminating on this zone because the zone is
genuinely dense, dense-priced and mostly well supplied. The discrimination has to come from
the *route* decision, not from the locality verdict.

The margin for error on those four rows is one point of saturation index. If the Little Angels
house-call arm does not actually cover the Navalur apartment pockets — a live question, since
the arm is a physical operation based in Navalur rather than a published service area — the
index falls to 62 and all four become GO, which would move them to ranks 19–22 with Rs
35.1 lakh of monthly revenue between them.

## 6. Route clusters and the shape of the day

| Cluster | Localities | Cases/mo | Households | Services per trip | Note |
|---|---|---|---|---|---|
| B-R1 Navalur | 8 | 3,833 | 16,573 | 6–7 | ECR-north anchor, one gate-to-gate loop |
| B-R2 Kandanchal | 8 | 2,192 | 9,991 | 6 | **the stretched cluster** — Mappedu is 8 km inland |
| B-R3 Sholinganallur | 8 | 2,993 | 17,368 | 6 | the hub itself; long hops between IT campuses |
| B-R4 Palavakkam | 10 | 5,596 | 25,539 | 6–7 | **ten localities — one over the brief's 3–8 rule**; the model splits it into a Palavakkam half and an Enjambakkam half sharing one vehicle day |
| B-R5 Perungudi | 5 | 5,663 | 25,655 | 6–7 | the densest case count per locality in the zone |
| B-R6 Madipakkam | 5 | 3,353 | 13,621 | 6 | 4–5 km west of the OMR spine; internal-network access |
| B-R7 Thiruvanmiyur | 6 | 8,543 | 38,366 | 6 | highest case density; on the Zone A seam |

**The brief asks for clusters of three to eight localities; B-R4 has ten.** The repair
instruction listed route clusters as working and not to be rebuilt, so the cluster definition
was left alone and the deviation is flagged here instead: B-R4 must be worked as two
half-loops — Palavakkam B25–B28 and Enjambakkam with Sungudi B29–B34 — sharing one vehicle
day, and the dataset's own cluster note says so.

Every locality in the zone is flagged `clustered` and 6 or 7 services per trip are feasible on
the 46-minute clustered cycle. The corridor constraint is real but not binding at this
density: B-R2 is the cluster that breaks, because Mappedu sits 8 km inland from the OMR spine,
which at the spine's 3.125 minutes a kilometre adds about 25 minutes each way on top of the
corridor run — and B-R2 is the only cluster where all eight localities are limited to six
services a trip.

**The route arithmetic that matters:** one route carries 144 cases a month (6 visits a day ×
24 operating days). 48 of the 50 localities can fill one route on their own; 38 can fill two.
Running one route in each of the 48 absorbs 6,912 cases a month — **21.5% of the zone's
32,172**. The remaining 78.5% is unreachable at one vehicle per locality, which is why the
serviceable ceiling, not the revenue potential, is the number to plan against. The best
single-route contribution in the zone is Rs 1,47,600 a month; two routes, Rs 2,95,200.

## 7. Hour and weekday shape

Zone demand by hour: 11:00 **10.70%**, 10:00 9.43%, 15:00 9.37%, 16:00 8.82%, 12:00 7.83%,
14:00 7.83%, 17:00 6.92%, 09:00 6.59%, 13:00 6.30%, 18:00 4.82%, 08:00 4.60%, 19:00 3.81%,
and under 2% from 06:00 and after 20:00.

The **10:00–16:00 bookable window carries 60.3%** of zone demand; the whole 07:00–19:59 band
carries 90.1%. Two hours — 11:00 and 15:00 — carry a fifth of the day's demand between them,
and the 12:00–13:00 dip is a lunch-hour trough in the corporate belt. Extending past 16:00
buys the 17:00–19:59 tail (15.6%) and runs straight into the 2:45–4:15 pm band the spine
flags as the worst congestion on comparable Chennai corridors: 15:00 and 16:00 are already the
third and fourth heaviest hours. **The spine's 10:00–16:00 window is the right call, and the
curve does not argue against it.**

Staffing on the new cases: at 11:00 the zone needs **143.5 visits a day in that hour and 111
staff on duty** at the 1.30 visits-per-hour clustered cycle; at 10:00, 126.4 visits and 97
staff. Across the whole day the zone's 32,172 cases a month is 1,340 visits a day, which at
the spine's six-visit route ceiling is **223 vehicle-days** — the same number as the prize
divided by the 144-case route capacity (32,172 ÷ 144 = 223). A one-vehicle-per-locality
launch in the 48 localities that can fill a route absorbs 6,912 of those cases, 21.5%.

**Weekday split** (zone demand): Saturday 17.75%, Friday 14.96%, Thursday 14.02%, Monday
13.55%, Tuesday 13.45%, Wednesday 13.45%, Sunday 12.82%. The weekend uplift runs +17.1% for
commercial streets, +10.8% for every residential built form and **−6.1% for industrial**:
Saturday is the day apartment associations can convene and owners are home, and an office
campus' pet demand follows the working week. Sunday is the weakest day in every built form
except industrial.

## 8. Seasonality

Zone index, averaged across the fifty localities: **Jan 121.5, Feb 115.7, Mar 108.1, Apr 92.7,
May 85.3, Jun 88.9, Jul 79.1, Aug 82.8, Sep 99.7, Oct 103.5, Nov 109.6, Dec 113.2**.

- **January and February are the revenue months.** They are also post-campaign renewal months:
  the GCC mass campaign of 11 August to 21 October 2026 vaccinated 1,50,303 dogs against a
  2,00,000 target, and licences are valid for one year from the date of vaccination, so
  January–February carries renewal demand.
- **July is the trough at 79.1** — the monsoon cuts visit capacity, and Zone B's covered-lobby
  stock offsets only part of it. The covered-stock index (May 92.0, July 86.1 after
  normalisation) is the mildest summer penalty of the two study zones, as the brief required:
  10.2% above open layouts in May and 11.5% in July.
- **October to December is the acquisition window, not the revenue window.** The index climbs
  from 103.5 to 113.2 while the GCC is giving the same vaccination and microchipping away free
  at 11 centres. Campaign months are acquisition months; the licence-compliance bundle is sold
  into them and it is priced against a free alternative, so the margin sits in the filing and
  the doorstep, not in the shot.

## 9. The competitive picture

Between 6 and 9 named operators reach every locality in the zone.

| Operator | Type | Reaches | Observed price |
|---|---|---|---|
| Vetic — Vet at Home | clinic home-visit arm | 50 of 50 | Rs 399 |
| EASZO Petcare — at-home | clinic home-visit arm | 50 of 50 | Rs 599 |
| ThePetNest — Veterinary at Home | clinic home-visit arm | 50 of 50 | Rs 699 |
| Petter | marketplace | 50 of 50 | no published price |
| PetCare.AI | directory | 50 of 50 | no published price |
| CavinKare / Sanchu | corporate mobile | 50 of 50 | no published price |
| Little Angels Navallur home-visit arm | house-call | 16 (Navalur and OMR) | Rs 299 / Rs 599 |
| GCC ABC Centre, Sholinganallur | free | 23 | free |
| GCC Pet Clinic & ABC, Meenambakkam (B V Nagar) | free | 10 | Rs 50 licence |
| Chezhian Veterinary Hospital, Thiruvanmiyur | clinic | 6 | — |
| Blue Cross of India, Adyar (NGO, outside the zone) | NGO | 6 | — |

**Saturation runs 39 to 71.** The two ends are the interesting ones. The floor is Tidel Park at
39 — an IT-campus node with no GCC centre inside its catchment and no house-call operator, the
least served place in the zone. The ceiling is the Navalur apartment cluster at 71, and the
only reason it is not higher is that no GCC pet clinic sits inside Navalur itself. The GCC
Sholinganallur ABC centre is 5.3 km away and covers 23 localities, which is a real competitive
constraint on the whole northern cluster.

Two structural points the numbers make:

1. **The three home-visit arms and the two marketplaces are in every locality, and their
   published prices (Rs 399–699) sit 45–75% below our blended price of Rs 1,270–1,875.** Our
   mix is not competing on price; it is competing on chronic, geriatric and end-of-life work
   with continuity, on a licence-compliance bundle priced at Rs 1,299 against a free
   alternative, and on aftercare. The market mix averages Rs 808–1,307 a visit depending on
   affluence, so our mix is the premium layer, and the whole thesis depends on the
   price-tolerance of the built forms that carry it.
2. **The GCC free supply is the real competitor in the middle of the zone, not the private
   operators.** 23 localities have a free ABC centre within reach and 10 have a free pet
   clinic; the campaign vaccinated 1,50,303 dogs against a 2,00,000 target and the licence
   costs Rs 50. Any route that sells vaccination or microchipping at a markup is selling
   against free supply. The licence-compliance bundle is priced at Rs 1,299 for what the
   centre does for Rs 50 — that is the gap the model is betting on, and the reason it must be
   sold as "the house call, the portal filing, the vaccination, the microchip record, one
   visit" and not as a vaccination.

## 10. What would change the verdict

| Change | Effect |
|---|---|
| The Little Angels house-call arm does not cover the Navalur apartment pockets | Saturation 71 → 62 for four localities: **all four HOLDs become GO**, worth Rs 35.1 lakh of monthly revenue, and they move to ranks 19–22 |
| A per-ward household split instead of the zone-wide split | Madipakkam falls from 2,951 households to about 540, Perungudi's cluster loses about two-thirds of its households. The zone total is unchanged and the verdicts barely move, but the *locality* rankings would reorder completely. This is the single largest structural uncertainty in the dataset |
| The affluence index is wrong by 0.1 on any locality | Our blended price moves by about Rs 26–36 on a residential or apartment locality. A 0.1 fall on Thiruvanmiyur Indira Nagar takes it from Rs 1,599 to Rs 1,560 — still GO. The price *test* is not binding anywhere, but the *revenue rank* is price-sensitive: monthly revenue moves about 2.4% for every 0.1 of affluence |
| The pet-ownership rate is not 17.3% but the unscaled 7.4% | Pet-owning households fall from 25,440 to about 10,200 and the licence-compliance pool from 27,025 unlicensed pets to about 6,200. The cases and the verdicts do not move; the acquisition case for the licence bundle loses three-quarters of its size |
| Cases per household are re-based on pet-owning households rather than all households | Zone cases fall from 32,172 to about 5,560 a month, a 5.8-fold difference in the size of the prize. Six localities — the Enjambakkam four, Mappedu and R.M.Z. Ecoworld — fall below the 40-case GO threshold and turn HOLD; the remaining 44 still pass. The route plan is sized against the prize, and the prize shrinks by 83%. **This is the assumption that most needs a decision from the business, not from the model** |
| The Zone A seam resolves against Zone B | The B-R7 cluster (8,543 cases, Rs 1.22 crore) and B24 Tidel Park (rank 10) sit on the seam. If Thiruvanmiyur and Tidel Park pull north, the top of the ranking changes hands and the southern anchor's justification weakens |
| The B-R4 cluster is split into two vehicle days | Palavakkam (B25–B28) and Enjambakkam with Sungudi (B29–B34) stop sharing a day. The Enjambakkam four alone carry 3,291 households and 778 cases a month and need their own route, or they get served from the Sungudi loop |

## 11. The three things to decide next

1. **Base or do not base.** The southern cluster (B-R7 Thiruvanmiyur plus B-R5 Perungudi)
   carries Rs 2.01 crore of monthly revenue potential, 11 of the 50 localities, 44.2% of the
   zone's cases and 43.0% of its revenue, on saturation of 50–63 — below the 67–71 that the
   northern OMR clusters carry. Every other option in this zone is a satellite to it. But it is
   also on the Zone A seam — settle the seam before committing capital to a base there,
   because the base cannot move.
2. **The per-ward versus zone-wide split.** This is the one modelling decision that would
   change the ranking of localities rather than the size of the zone, and it is a decision,
   not a measurement: the census cannot settle it, because the 2011 ward structure does not
   map one to one onto the current 200 wards. Re-run `_work/build_localities.py` with the
   split changed and the whole top-20 reorders.
3. **Cases per household, or per pet-owning household.** The current model says 32,172 cases a
   month in the zone on a per-household rate of 0.2187. Re-based on pet-owning households it
   says about 5,560. That is a 5.8-fold difference in the size of the prize, and it is a
   definitional choice made inside the model. It should be settled before any capital is
   committed, and the review band (0.05–0.25 cases per household per month) is what forces the
   current reading.
