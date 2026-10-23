# SOURCES — Zone A (south-east Chennai: Velachery, Pallikaranai, Medavakkam, Chromepet, Tambaram, Mangadu)

Every source used to build `research/zone-a/localities.json`, with the full URL, what it was used
for, and which figures in the dataset it anchors.

**Provenance tiers used throughout:** **A** = sourced, the page or dataset was loaded;
**B** = derived from tier A inputs by a formula stated in `MODEL.md`; **C** = modelled, an informed
estimate with the assumption and its uncertainty band stated in `MODEL.md`.

**On this repair pass.** Zone A's collection scripts are preserved in `tools/`
(`geocode.ps1`, `geocode2.ps1`, `geocode3.ps1`, `master.mjs`). Sources 1 and 5 below were loaded
live in this repair pass to close the density arithmetic; sources 2 and 4 are listed because the
dossier's method rests on them and because the gap is visible, and each states plainly that it
anchors **no** figure in this zone. Where a portal could not be re-loaded by an automated request,
it is named as an unverified pointer and its tier is marked accordingly.

---

## 1. Census 2011 enumeration blocks (tier A) — the Corporation density frame

| | |
|---|---|
| **Dataset** | Census 2011 enumeration-block population, Chennai Corporation (8,802 rows, summed over `Name of Town = Chennai (M Corp.)`) |
| **Publisher** | OpenCity data portal (data.opencity.in), Census 2011 primary data, Chennai Corporation ward and enumeration-block level |
| **URL** | https://data.opencity.in/api/3/action/datastore_search?resource_id=14e58af6-7ed9-4445-bb47-acc931364c12&limit=9000 |
| **Package page** | https://data.opencity.in/dataset/db288d43-56e3-48f4-9932-710d80872155 |
| **Fields used** | `Name of Town`, `Ward Number`, `Enumberation Block`, `Total Population`, `SC Population`, `ST Population` |
| **Loaded** | live in this repair pass, all 8,802 rows summed |

**Anchors in `localities.json`:** the Corporation's 2011 population of **4,621,135** for
`Chennai (M Corp.)`. That figure, divided by 3.8 persons per household and set over the
Corporation's 174 sq km extent, gives the **6,989 households per km²** that every
`population.basis` string compares the zone against. It anchors **no household figure** in Zone A:
the zone's households are a footprint times an archetype density, not a census allocation (see
`MODEL.md` §3 and the arithmetic check in §3.4).

**Probed and not used:** the `Housing and Houselisting Data 2011` resource
(`7dee8eaa-e4d8-44af-a5de-4b8e96da0c95`) and the `ST Households Amenities and Assets 2011`
resource (`3c3d42b0-e549-42d1-847e-a6a1e24cf166`) on the same package page. Neither carries a ward
household count usable against the post-2021 200-ward structure, and this zone does not allocate
households by ward in any case.

## 2. Greater Chennai Corporation boundary and extent (tier A) — the 174 sq km frame

| | |
|---|---|
| **Document** | Greater Chennai Corporation, Roads Department, "About the Roads Department" — the Corporation's own statement of its extent and its divisions |
| **Publisher** | Greater Chennai Corporation |
| **URL** | https://chennaicorporation.gov.in/departments/roads/index.htm |
| **Loaded** | live in this repair pass |

**Anchors in `localities.json`:** the **174 sq km** Corporation extent used in the density
reconciliation in every `population.basis` string. The page states that "the boundaries of Chennai
city with an extent of 174 sq.km were fixed in 1978", that the Corporation expanded "from 174sq.km
to an extent of 426 sq.km by amalgamating 9 Municipalities, 8 Town Panchayats and 25 Village
Panchayats", and that it now has "200 divisions with 426 Sq.Km in 2011". The 200-division figure is
the reason no 2011 ward table can be mapped one-to-one onto the current ward structure, which is
why Zone A's household base is tier C.

## 3. GCC press releases and veterinary pages (tier A) — the licence regime and the free supply

| Source | URL | Used for |
|---|---|---|
| **Publisher** | Greater Chennai Corporation, with New Indian Express, Times of India and CitizenMatters for the press coverage | |
|---|---|---|
| GCC PR-151, "Dog License Extended for 15.06.2026" (12 May 2026) | https://www.chennaicorporation.gov.in/news/news_20260512_1.pdf | **78,392 licences issued, 9,656 not renewed, 68,736 active** — the anchor for the licence split of every pet base |
| GCC PR-601, "Dogs Vaccination" (22 Oct 2026) | https://chennaicorporation.gov.in/news/news_20261022_2.pdf | **1,50,303 dogs vaccinated** in the 11 Aug – 21 Oct 2026 campaign — the campaign-window framing in the seasonality basis |
| GCC PR-372, "Stray Dogs Anti Rabies Vaccination" (10 Aug 2026) | https://chennaicorporation.gov.in/news/news_20260810_4.pdf | the campaign's **2,00,000-dog target** — the Corporation's own working estimate of the city dog population, used to calibrate the animal rates |
| GCC veterinary, "About" | https://chennaicorporation.gov.in/gcc/veterinary/about/ | the free pet clinics and ABC centres and their divisions; anchors the GCC entries in `competition.named` |
| GCC veterinary pet clinic contact page | https://chennaicorporation.gov.in/gcc/veterinary/contact/petclinic/ | the **Meenambakkam pet clinic at B V Nagar, Nanganallur 600061**, open 8:00 to 15:00 — the only free GCC facility inside this zone's footprint |

Press coverage of the same licence figures is carried in the spine report's reference list:
New Indian Express (13 May 2026) https://www.newindianexpress.com/cities/chennai/2026/May/13/gcc-extends-deadline-to-get-pet-licence-to-june-15,
Times of India (licence extension) https://timesofindia.indiatimes.com/city/chennai/chennai-corpn-extends-pet-licence-regn-renewal-deadline-till-june-15/articleshow/131048375.cms,
Times of India (13,000+ unrenewed; about one lakh dogs microchipped) https://timesofindia.indiatimes.com/city/chennai/over-13000-pet-dog-licences-yet-to-be-renewed-in-chennai/articleshow/131865414.cms,
CitizenMatters licence guide https://citizenmatters.in/how-to-apply-for-a-pet-licence-in-chennai-a-step-by-step-guide/.

**Anchors in `localities.json`:** the **licence penetration of every pet base** (46 percent for a
`dense_apartment` inside GCC limits, 42 for `mid_apartment`, 38 for `mixed_res`, 34 for
`township`, 28 for `industrial`, 40 for `commercial`, and 10 percent outside GCC limits where the
GCC portal, the free microchipping and the Rs 5,000 penalty regime do not reach), the
**Rs 899 licence-compliance bundle** in the our-mix ladder and the **Rs 250 licence line** in the
market ladder, and the GCC free-supply rows in `competition.named` (the Meenambakkam centre is
attached to the nine Medavakkam, Chembedu, Moovarasampettai and Otteri localities — A25 to A29,
A31, A32, A46 and A47).

## 4. GCC residential property-tax ledger, ward-wise (tier A) — checked, and deliberately not used

| | |
|---|---|
| **Dataset** | Greater Chennai Corporation ward-wise property-tax collection and demand, FY2013-14 to FY2017-18, residential and commercial (200 wards) |
| **Publisher** | Greater Chennai Corporation, republished on OpenCity |
| **URL** | https://data.opencity.in/api/3/action/datastore_search?resource_id=27905e77-2ef3-45b6-b14a-562bd3e37944&limit=250 |
| **Package page** | https://data.opencity.in/dataset/3107497a-f12a-49a8-bc2a-c92c3ccb0b67 |
| **Fields used** | none in this zone |
| **Loaded** | by the sibling zone's collection script; package metadata re-verified live in this pass |

**Anchors in `localities.json`: none.** The ledger gives built stock by ward, and Zone A's
household base is not allocated from ward totals — it is a footprint times an archetype density.
The ledger is the household *split* for the sibling zone, and it is listed here so that the
difference between the two zones' household methods is on the record rather than hidden. Zone A
would need a ward-level allocation to use it, and the 2011 ward structure cannot be mapped onto
the current 200 divisions (see §2).

## 5. GCC ward street inventory (tier A) — place identity, checked, and not used for any figure

| | |
|---|---|
| **Dataset** | "Chennai Street Names" — street names by ward, area sabha and locality, all 200 wards |
| **Publisher** | Greater Chennai Corporation, republished on OpenCity |
| **URL** | https://data.opencity.in/dataset/18ac8acd-0dbd-4d8d-a7dd-eba4fcf95464/resource/f0577e43-2f14-4233-a922-f0ca08811d99/download/3b816670-2d4b-47fb-a702-9946890d700a.csv |
| **Package page** | https://data.opencity.in/dataset/18ac8acd-0dbd-4d8d-a7dd-eba4fcf95464 |
| **Fields used** | `Ward`, `Area`, `Locality`, `Street` |
| **Loaded** | by the sibling zone's collection script; package metadata re-verified live in this pass |

**Anchors in `localities.json`: no figure.** Zone A's fifty localities are geocoded place records
(§6), not street-ledger entries; the street ledger was used in the sibling zone to derive a ward
household split, which Zone A does not use. It remains the independent check on the **ward names**
carried in this zone's `ward` field, and it is the list the Corporation gazetted at
https://chennaicorporation.gov.in/gcc/area_sabha/pdf/gazette.pdf ("Formation of Area Sabha's in 200
wards of Greater Chennai Corporation", Tamil Nadu Government Gazette Extraordinary, 17 December
2022).

## 6. OpenStreetMap and Nominatim (tier A) — coordinates, wards, pin codes and the built weight

| Source | URL | Used for |
|---|---|---|
| **Publisher** | OpenStreetMap Foundation, Nominatim geocoding service | |
|---|---|---|
| Nominatim search, pass 1 — one place record per locality | https://nominatim.openstreetmap.org/search?q=CHENNAI&format=json&limit=1&addressdetails=1&countrycodes=in | the `lat` / `lon` of every locality, from the OSM place record |
| Nominatim search, pass 2 — viewbox-bounded, up to six hits | https://nominatim.openstreetmap.org/search?q=CHENNAI&format=json&limit=6&addressdetails=1&countrycodes=in&viewbox=12.76,80.05,13.00,80.30 | resolving the sub-locality names that the first pass could not place, and the GCC ward each locality falls in |
| Nominatim search, pass 3 — up to five hits, no viewbox | https://nominatim.openstreetmap.org/search?q=CHENNAI&format=json&limit=5&addressdetails=1&countrycodes=in | the final pass for the remaining names |
| OpenStreetMap place records, per locality | https://www.openstreetmap.org/ | the `notable_clusters` named-project lists and the locality identity in `cluster_assets` |

**Local copies:** `tools/geocode-raw.json` (pass 1), `tools/geocode-pass2.json` (passes 2 and 3).

**Anchors in `localities.json`:** every `lat` / `lon`; the `ward` and `assembly_constituency` of
every locality; the `pin_codes` array; the `travel_km_to_hub` and `travel_min_to_hub` straight-line
and circuity-corrected distances to the Velachery hub; and the `cluster_assets.notable_clusters`
named-project lists.

**Caveat carried into the dataset:** 20 of the 50 localities returned no operator named from their
own page, which the `key_caveats` state as "not found in the sources that loaded", not confirmed
absence.

## 7. Operator price pages (tier A) — the market ladder and the competition map

| Operator | URL | Observed price | Where it anchors |
|---|---|---|---|
| **Publisher** | The operators themselves (Little Angels Pet Clinic, Vetic, EASZO Petcare, Petter.in, Blue Cross of India, Sanchu Animal Hospital) and the Indian veterinary directories Justdial and Lybrate | | |
|---|---|---|---|
| Sanchu Animal Hospital, Velachery | https://www.justdial.com/Chennai/Sanchu-Animal-Hospital-Opposite-Vijayanagar-Bus-Stand-Velacheri/044PXX44-XX44-220611033159-E8Z6_BZDET | not published | `competition.named` for A39, rating 4.4 across 1,217 reviews |
| Auro Multi Specialty Pet Hospital, Velachery | https://www.justdial.com/Chennai/Auro-Multi-Specialty-Pet-Hospital-Above-HDFC-Bank-Ltd-Velacheri/044PXX44-XX44-110707182856-L8E5_BZDET | not published | `competition.named` for A39, rating 4.1 across 622 reviews |
| AURO PET CLINIC, Velachery | https://www.lybrate.com/chennai/clinic/auro-pet-clinic-velachery | Rs 350 | `competition.named` for A39 |
| Little Angels Pet Clinic, home-visit arm | https://www.littleangelspetclinic.com/vet-home-visit-chennai.html | Rs 299 | `competition.named` zone-wide; market ladder line |
| Vetic — Vet at Home | https://vetic.in/vet-at-home | Rs 399 | `competition.named` zone-wide; market ladder line |
| EASZO Petcare — at-home consultation | https://easzopets.com/services/general-checkup/ | Rs 599 | `competition.named` zone-wide; market ladder line |
| Petter.in — independent-vet home-visit marketplace | https://www.petter.in/for-vets | no published price | `competition.named` zone-wide; saturation weight 4 |
| Blue Cross of India, Guindy shelter and pet crematorium | https://bluecrossofindia.org/What-We-Do.html | no published price | `competition.named` for A39, A42, A44, A45, A46, A47, A49, A50 |
| Sanchu Animal Hospital, Taramani Link Road | https://veterinary-hospital.sanchuanimalhospital.com/sanchu/chennai/velachery/ | not published | `competition.named` for the Taramani and Medavakkam rows |
| K K Pet Clinic, Ashok Nagar | https://www.justdial.com/Chennai/K-K-Pet-Clinic-Backside-Sangamam-Hotel-Ashok-Nagar/044PXX44-XX44-160312115354-S1N5_BZDET | not published | `competition.named` for A39 |
| Thanigai Pet Care Hospital, Velachery | https://www.justdial.com/Chennai/Thanigai-Pet-Care-Hospital-Opposite-to-Chennai-Silks-Velacheri/044PXX44-XX44-171129090830-H9X7_BZDET | not published | the Velachery hub rationale |
| Camp Road Animal Hospital, Selaiyur | https://www.justdial.com/Chennai/Camp-Road-Animal-Hospital-Near-Bethesda-Hospital-IOB-Colony-K-V-K-Nagar-Selaiyur/044PXX44-XX44-100427120047-R3A5_BZDET | not published | `competition.named` for the Selaiyur cluster |
| Chrome Pet Clinic, Chromepet | https://www.justdial.com/Chennai/Chrome-Pet-Clinic-Next-to-Mahesh-Hyper-Market-Chromepet/044PXX44-XX44-190608195509-P6N7_BZDET | not published | `competition.named` for the Chromepet cluster |
| Sks Veterinary Hospital, Chromepet | https://www.justdial.com/Chennai/Sks-Veterinary-Hospital-Chromepet/044PXX44-XX44-221120031317-G3Q1_BZDET | not published | `competition.named` for the Chromepet cluster |
| Aurom Multi-speciality Pet Hospital, Velachery | https://www.justdial.com/Chennai/Aurom-Multi-speciality-Pet-Hospital-Velacheri/044PXX44-XX44-220706145824-L9V5_BZDET | not published | `competition.named` for A39 |
| Vels Pet Hospital, Pallikaranai oil mill | https://www.justdial.com/Chennai/Vels-Pet-Hospital-pet-Shop-pet-Spa-Near-By-Oil-Mill-Bus-Stop-Pallikaranai/044P6101066_BZDET | not published | `competition.named` for the Pallikaranai cluster |
| Perungudi Veterinary Hospital | https://www.justdial.com/Chennai/Veterinary-Hospitals-in-Velachery-Main-Road-Velacheri/nct-10519292 | not published | `competition.named` for A04, A25, A30, A33–A37 |
| Dr. P. Ramadass, Medavakkam | https://www.justdial.com/Chennai/Dr-P-Ramadass-Near-Venkateswara-Nagar-Medavakkam/044PXX44-XX44-151028140044-L5Y3_BZDET | not published | `competition.named` for the Medavakkam cluster |
| Ashoka Vet Clinic, Tambaram Sanatorium | https://www.justdial.com/Chennai/Ashoka-Vet-Clinic-Behind-Grt-Jewellers-Tambaram-Sanatorium/044PXX44-XX44-190531143355-U1K2_BZDET | not published | `competition.named` for A01–A03 |
| Vet At Home, Perungalathur | https://www.justdial.com/Chennai/Vet-At-Home-Near-Surathamman-Temple-Perungalathur/044PXX44-XX44-160620173514-T1L3_BZDET | not published | `competition.named` for the Selaiyur cluster |
| Vet Xpress, Sembakkam | https://www.justdial.com/Chennai/Vet-Xpress-Near-MAV-School-Sembakkam/044PXX44-XX44-190719184924-W2X9_BZDET | not published | `competition.named` for A01–A03 |
| Renu Pet Clinic and Grooming Studio | https://gullytails.com/listing/renu-pet-clinic-and-grooming-studio | not published | `competition.named` for A05 and the Pammal row |
| D G Veterinary Clinic, Tambaram | https://www.lybrate.com/chennai/clinic/d-g-veterinary-clinic-tambaram | not published | `competition.named` for the Tambaram cluster |
| Dr Chandran Aruldas Clinic, Tambaram | https://www.lybrate.com/chennai/clinic/dr-chandran-aruldas-clinic-tambaram | not published | `competition.named` for the Tambaram cluster |
| R K Pet Clinic, Madipakkam | https://www.lybrate.com/chennai/clinic/r-k-pet-clinic-madipakkam | not published | `competition.named` for A47 |
| Greater Chennai Corporation Veterinary Pet Clinic and ABC Centre, Meenambakkam | https://chennaicorporation.gov.in/gcc/veterinary/contact/petclinic/ | free | `competition.named` for ten localities; saturation weight 8 |

**Anchors in `localities.json`:** the **ten-line market mix ladder** (Rs 250 licence line to the
Rs 6,800 median home euthanasia), the per-locality `price.market_mix.avg_visit_price` (Rs 930–986
after the affluence modifier), the `competition.named` arrays (3 to 8 operators per locality) and
therefore the whole `saturation_index` (12–59).

**Not loaded:** per-operator ratings and review counts on the Lybrate and Gully Tails pages beyond
those captured in `master.mjs`; Justdial served full listing data for only its first three requests
per address before soft-blocking, and Gully Tails indexes 284 Chennai clinics of which one page
loaded. Both facts are carried in the dataset's `key_caveats`.

## 8. Property portals (tier A where re-loaded, tier B pointer where not) — the affluence axis and cluster assets

| Source | URL | Tier | Used for |
|---|---|---|---|
| **Publisher** | MagicBricks, 99acres, propspedia and SquareYards, and the Chennai Gated Community index | | |
|---|---|---|---|
| MagicBricks, Velachery residential listings | https://www.magicbricks.com/property-for-sale/residential-real-estate/velachery/chennai | **A** — re-loaded live in this pass (HTTP 200) | the MagicBricks median Rs per sq ft that drives the affluence modifier, and the "flats listed" count behind `cluster_assets.listings` |
| Chennai Gated Community index | https://chennaigatedcommunity.in/ | **A** — re-loaded live in this pass (HTTP 200) | the known unit counts and named-project lists in `cluster_assets.notable_clusters` |
| 99acres, Velachery gated-community projects | https://www.99acres.com/property-for-sale/residential-real-estate/velachery-chennai-p/projects | **B — unverified pointer.** The page returned HTTP 403 to an automated request in this pass | the gated-community project count behind `cluster_assets.gated_communities` (310 for A39, 473 for A49) |
| propspedia, Velachery prices | https://propspedia.com/chennai/velachery | **B — unverified pointer.** The page returned HTTP 308 into a redirect loop in this pass | the cross-check on the MagicBricks median (Rs 25,050 per sq ft for Pammal against a MagicBricks median of Rs 7,500) |
| SquareYards, Velachery gated-community card | https://www.squareyards.com/property-for-sale/residential-real-estate/chennai/velachery | **B — unverified pointer.** The connection was closed in this pass | the gated-community project counts behind `cluster_assets.gated_communities` |

**Anchors in `localities.json`:** the **affluence index** (0.62–0.95) through the
`price.market_mix.avg_visit_price` modifier and the pet-base affluence slope; the
`cluster_assets.apartment_complexes` (0–20), `gated_communities` (0–310) and `listings` counts; and
the `services_per_trip_possible` figure (1–7), which is a function of the apartment-complex count
and the pet-friendly-association count.

**Caveat carried into the dataset:** propspedia samples run 1 to 17 listings and MagicBricks samples
14 to 39, so both are noisy; the widest gap in the set is Pammal at Rs 7,500 on the MagicBricks
median against Rs 25,050 on propspedia, and the MagicBricks median is the one used. Rent per sq ft
was not found on any site that loaded, so the affluence axis rests entirely on sale prices and
understates renter-constrained localities.

## 9. The spine report (tier A, internal) — the constants and the two service mixes

| | |
|---|---|
| **Document** | `C:\Users\aswat\Downloads\Projects\mobile-vet-report\content\final_turn_001.md`, copied into this directory as `spine-report.md` |
| **URL** | none — an internal deliverable, not a web page |

**Anchors in `localities.json`:** the cost per clustered visit **Rs 850** and the scattered cost
Rs 1,498; the hard blended-price floor **Rs 1,100** and the Rs 1,199 month-six gate; the travel
constants (31 min 15 s per 10 km average, 41 min 6 s evening peak, 21 min travel plus 25 min
clinical work per clustered visit); the **our-mix service ladder** (extended consultation with
blood panel and written plan Rs 1,699, chronic monitoring pay-as-you-go Rs 1,199, chronic
monitoring under annual plan Rs 825, senior wellness bundle Rs 1,999, vaccination at home Rs 899,
licence-compliance bundle Rs 899, home end-of-life with aftercare Rs 8,150, routine consultation
Rs 699 as off-peak filler only) and the market ladder it observed; the feasible ceiling of six
visits a day on one route; the active-licence and campaign constants; and the seasonal, hour and
weekday reasoning behind the indices. Its 83 reference URLs are the source list behind sections 3,
6 and 8 above.

## 10. Sources that do **not** exist for this zone (stated so the gap is visible)

- **Pet-ownership rate.** No Chennai or India household-survey figure for the share of households
  owning a pet was loaded. The pet-ownership rate (2.25% to 6.84% by built form) is tier C and
  the reviewer's 15–30% sanity band is met by construction, not by observation.
- **Rent or sale price per sq ft, checked directly.** Only the five property portals in §8 were
  reached, and only two of them loaded to an automated request in this pass. The affluence index is
  a modelled construct from the sale-price median and the built form.
- **Ward-level household counts for the current 200 divisions.** The Census 2011 enumeration blocks
  (§1) are in the pre-2021 ward structure and the Corporation's own street list (§5) is in the
  post-2021 one; the two cannot be joined.
- **Pet-friendly resident welfare associations.** No association register for this cluster was
  published on any page loaded. `cluster_assets.pet_friendly_associations` is a modelled lower
  bound set from the apartment-complex count.
- **Per-operator ratings and review counts** for every operator (see §7).
- **Any route or booking data.** Nothing in this zone's model is validated against observed visits.
