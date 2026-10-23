# SOURCES — Zone B (OMR and ECR corridor, south Chennai)

Every source used to build `research/zone-b/localities.json`, with the full URL, what it was
used for, and which figures in the dataset it anchors. Nothing in this file is a pointer to a
page that was not loaded: every URL below was fetched by the collection scripts preserved in
`_work/`, or was verified live in this research pass, or is cited in the spine report's own
reference list, which was loaded.

**Provenance tiers used throughout:** **A** = sourced, the page or dataset was loaded;
**B** = derived from tier A inputs by a formula stated in `MODEL.md`; **C** = modelled, an
informed estimate with the assumption and its uncertainty band stated in `MODEL.md`.

---

## 1. Census 2011 enumeration blocks (tier A) — the household base

| | |
|---|---|
| **Dataset** | Census 2011 enumeration-block population, Chennai Corporation (8,802 records) |
| **URL** | `https://data.opencity.in/api/3/action/datastore_search?resource_id=14e58af6-7ed9-4445-bb47-acc931364c12&limit=9000` |
| **Publisher** | OpenCity data portal (data.opencity.in), Census 2011 primary data, Chennai Corporation ward/zone level |
| **Fields used** | `Name of Town`, `Ward Number`, `Enumberation Block`, `Total Population`, `SC Population`, `ST Population` |
| **Local copy** | `_work/census_full.json` |

**Anchors in `localities.json`:** the Corporation population of **4,621,135** for
`Chennai (M Corp.)`, which divided by the 4.0 average household size gives **1,155,283
households in 2011**; that figure, grown by the property-tax factor, is the **1,733,422
households in 2026** from which every ward household total and therefore the entire zone
household pool of **147,113** is derived. This is the only population source in the model.

**Not used:** the OpenCity `Housing` dataset (resource `7dee8eaa-e4d8-44af-a5de-4b8e96da0c95`,
161 records) and `Household Assets` dataset (resource `3c3d42b0-e549-42d1-847e-a6a1e24cf166`) —
both were probed in `_work/probe_housing.py` and neither carries a usable ward household count
(the housing resource is non-tabular). Households are therefore population ÷ 4.0, not a
published household count. This is a real weakness of the model and is stated as such in
`MODEL.md`.

## 2. GCC residential property-tax ledger, ward-wise (tier A) — the household split

| | |
|---|---|
| **Dataset** | Greater Chennai Corporation ward-wise property-tax collection and demand, FY2013-14 to FY2017-18, residential and commercial (200 wards) |
| **URL** | `https://data.opencity.in/api/3/action/datastore_search?resource_id=27905e77-2ef3-45b6-b14a-562bd3e37944&limit=250` |
| **Publisher** | Greater Chennai Corporation, republished on OpenCity |
| **Fields used** | `Ward No.`, `2013-14 … Residential`, `2017-18 … Residential` (collection, in crores) |
| **Local copy** | `_work/proptax.json` |

**Anchors in `localities.json`:** every **ward household total** (`ward_hh`), the Corporation
property-tax growth factor **1.41815** (FY2013-14 → FY2017-18, Rs 253.95 crore → Rs 179.07 crore
against Rs 253.95 crore collection), the 2026 carry factor **1.50043**, and through them the
per-ward split of the **147,113-household** zone pool and each locality's share of it. Ward 197
(Sholinganallur) carries the highest share at 4.925 crore and 33,616 households; ward 200
(Mappedu, Egumudi, Coop Nagar) the lowest at 0.249 crore and 1,703 households.

**Why it is the split and not the level:** the ledger gives *built stock by ward*, not people.
The level comes from the census, the share from the tax ledger.

## 3. GCC ward street inventory (tier A) — ward identity and the independent built-extent check

| | |
|---|---|
| **Dataset** | "Chennai Street Names" — street names by ward, area sabha and locality, all 200 wards |
| **URL** | `https://data.opencity.in/dataset/18ac8acd-0dbd-4d8d-a7dd-eba4fcf95464/resource/f0577e43-2f14-4233-a922-f0ca08811d99/download/3b816670-2d4b-47fb-a702-9946890d700a.csv` |
| **Publisher** | Greater Chennai Corporation (`https://chennaicorporation.gov.in`), republished on OpenCity |
| **Fields used** | `Ward`, `Area`, `Locality`, `Street` |
| **Local copy** | `_work/gcc_streets.csv` (2 columns retained: ward number, street name) |

**Anchors in `localities.json`:** the ward assignment of every locality (the 15 wards used are
180, 181, 182, 185, 186, 187, 188, 191, 193, 194, 195, 196, 197, 198, 200) and the street-token
cross-check quoted in each locality's `population.basis` and `cluster_assets.basis` — for
example ward 197 carries 13 "Chandrasekaran Avenue" streets plus Sowdeeswari Nagar road, and
ward 195 carries 6 "V.G.P. Avenue" streets. The token count is no longer used to size
households; it is retained as an independent check on the OSM built extent.

The same street list is gazetted by the Corporation at
`https://chennaicorporation.gov.in/gcc/area_sabha/pdf/gazette.pdf` ("Formation of Area Sabha's in
200 wards of Greater Chennai Corporation", Tamil Nadu Government Gazette Extraordinary,
17 December 2022).

## 4. GCC press releases and veterinary pages (tier A) — the licence regime and the free supply

| Source | URL | Used for |
|---|---|---|
| GCC PR-151, "Dog License Extended for 15.06.2026" (12 May 2026) | `https://www.chennaicorporation.gov.in/news/news_20260512_1.pdf` | **78,392 licences issued, 9,656 not renewed, 68,736 active** — the anchor for `LICENCE_PENETRATION` |
| GCC PR-601, "Dogs Vaccination" (22 Oct 2026) | `https://chennaicorporation.gov.in/news/news_20261022_2.pdf` | **1,50,303 dogs vaccinated** in the 11 Aug – 21 Oct 2026 campaign |
| GCC PR-372, "Stray Dogs Anti Rabies Vaccination" (10 Aug 2026) | `https://chennaicorporation.gov.in/news/news_20260810_4.pdf` | the campaign's **2,00,000-dog target** — the Corporation's own working estimate of the city dog population, used to calibrate the animal rates |
| GCC veterinary, "About" | `https://chennaicorporation.gov.in/gcc/veterinary/about/` | the **11 free centres** (6 pet clinics, 5 ABC centres) with their divisions and zones; anchors the GCC entries in `competition.named` for all 50 localities |
| GCC veterinary pet clinic contact page | `https://chennaicorporation.gov.in/gcc/veterinary/contact/petclinic/` | the **Meenambakkam pet clinic at B V Nagar, Nanganallur 600061** — the address that resolves the GCC's Meenambakkam / Enjambakkam naming collision |

Press coverage of the same licence figures is carried in the spine report's reference list:
New Indian Express (13 May 2026) `https://www.newindianexpress.com/cities/chennai/2026/May/13/gcc-extends-deadline-to-get-pet-licence-to-june-15`,
Times of India (licence extension) `https://timesofindia.indiatimes.com/city/chennai/chennai-corpn-extends-pet-licence-regn-renewal-deadline-till-june-15/articleshow/131048375.cms`,
Times of India (13,000+ unrenewed, about one lakh dogs microchipped) `https://timesofindia.indiatimes.com/city/chennai/over-13000-pet-dog-licences-yet-to-be-renewed-in-chennai/articleshow/131865414.cms`,
CitizenMatters licence guide `https://citizenmatters.in/how-to-apply-for-a-pet-licence-in-chennai-a-step-by-step-guide/`.

**Anchors in `localities.json`:** the licence split of every pet base
(`licensed_pets` / `unlicensed_pets`), the **Rs 1,299 licence-compliance bundle** in the our-mix
ladder, the **Rs 299 "Pet licence / compliance visit"** line in the market ladder, and the GCC
free-supply rows in `competition.named` (Sholinganallur ABC centre covers 23 localities,
Meenambakkam pet clinic and ABC centre covers 10).

## 5. OpenStreetMap (tier A) — coordinates, the built weight and the corridor spine

| Source | URL | Used for |
|---|---|---|
| Overpass API, named ways with `center` | `https://overpass-api.de/api/interpreter` — bounding box `12.76,80.05,13.00,80.30` | `building=apartments` and `landuse=residential` counts within 2.0 / 2.5 km of each locality — the **built weight** that splits the 147,113-household pool; also the OMR and ECR corridor spines used to position the OMR villages |
| Overpass API, places and administrative boundaries | `https://overpass-api.de/api/interpreter` — bounding box `12.74,80.05,13.06,80.36` | locality identity and coordinates (OSM place nodes for Navalur, Mappedu, Sholinganallur, Egumudi, Palavakkam, Perungudi, Madipakkam, Thiruvanmiyur, Enjambakkam, Sungudi, Indira Nagar, Sriram Nagar, Thandalam) and OSM ward polygons used to point-in-polygon place assignments |
| Overpass API, veterinary features | `https://overpass-api.de/api/interpreter` | the vet/clinic points used to check named competition |
| Nominatim search | `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&countrycodes=in` | sub-locality coordinates (Kandanchal, Thazhuthendur, Siruthai, Poothapedi, Kovilambedu, Egumudi, Sungudi, Enjambakkam, Palkalai Nagar, Karthikeyapuram, T. Nagar, Anchaneya Nagar) — tier B placements on the corridor spine |
| GeoNames search | `https://www.geonames.org/search.html?q=` | place-name spelling and variant checks on the OMR villages |
| postalpincode.in | `https://api.postalpincode.in/postal/` | the `pin_codes` array of every locality |
| OSM node: Chezhian Veterinary Hospital, Thiruvanmiyur | `https://www.openstreetmap.org/node?mlat=12.98694&mlon=80.25999` | `competition.named` entry for the Thiruvanmiyur cluster |
| OSM node: Blue Cross of India, Adyar (NGO, outside Zone B) | `https://www.openstreetmap.org/node?mlat=13.00612&mlon=80.26406` | `competition.named` entry for the Thiruvanmiyur cluster |

**Anchors in `localities.json`:** every `lat` / `lon`; the `households` figure of every
locality (through the built weight); `cluster_assets.apartment_complexes` and
`gated_communities` (0–31 and 0–38 across the fifty); `travel_km_to_hub` and
`travel_min_to_hub`; and the two OSM-sourced competition rows.

**Caveat carried into the dataset:** the OSM extract is sparse around B23 (R.M.Z. Ecoworld,
Thandalam) — no `building=apartments` feature and no `landuse=residential` polygon within 4 km —
so that locality's household figure rests on the model's minimum built weight and is flagged
`confidence: low`.

## 6. Operator price pages (tier A) — the market ladder and the competition map

| Operator | URL | Observed price | Where it anchors |
|---|---|---|---|
| Little Angels Pet Clinic, Navallur — home-visit arm | `https://www.littleangelspetclinic.com/vet-home-visit-chennai.html` | Rs 299 home visit | market ladder line 1; `competition.named` for the 16 Navalur / OMR localities |
| Little Angels Pet Clinic — home vaccination package | `https://www.littleangelspetclinic.com/terms-and-conditions.html` | Rs 599 home vaccination | market ladder line 2; `competition.named` for the same 16 localities |
| Vetic — Vet at Home | `https://vetic.in/vet-at-home` | Rs 399 | market ladder line 1; `competition.named` in all 50 |
| EASZO Petcare — at-home consultation | `https://easzopets.com/services/general-checkup/` | Rs 599 | market ladder line 2; `competition.named` in all 50 |
| ThePetNest — Veterinary at Home | `https://thepetnest.com/veterinary-at-home` | Rs 699 | market ladder line 5; `competition.named` in all 50 |
| Petter — independent-vet home-visit marketplace | `https://www.petter.in/for-vets` | platform, no published price | `competition.named` in all 50; saturation +5 |
| PetCare.AI — Chennai vetted-vet directory | `https://petcare.ai/vets` | directory, no published price | `competition.named` in all 50; saturation +5 |
| CavinKare Group / Sanchu Animal Hospital — vehicle-based mobile clinic and pet ambulance network | `https://www.cavinkare.in/` | corporate mobile, no published price | `competition.named` in all 50; saturation +4 |
| GCC Veterinary Pet Clinic & ABC Centre, Meenambakkam (B V Nagar, Nanganallur 600061) | `https://chennaicorporation.gov.in/gcc/veterinary/contact/petclinic/` | Rs 50 licence | `competition.named` for the 10 Palavakkam / Enjambakkam localities; saturation +8 |
| GCC Animal Birth Control Centre, Sholinganallur (Div 199, Zone XV) | `https://chennaicorporation.gov.in/gcc/veterinary/about/` | free | `competition.named` for 23 localities; saturation +8 |

**Anchors in `localities.json`:** the nine-line **market mix ladder** (Rs 199 sample collection
to the Rs 6,800 median home euthanasia), the per-locality `price.market_mix.avg_visit_price`
(Rs 808–1,307 after the affluence modifier), the `competition.named` arrays (6 to 9 operators
per locality) and therefore the whole `saturation_index` (39–71).

**Not loaded:** per-operator ratings and review counts were not published on these pages, so
`rating` and `reviews` are recorded as 0 and the saturation index is built from operator type
and count only. That is stated in the dataset's caveat list.

## 7. The spine report (tier A, internal) — the constants and the two service mixes

| | |
|---|---|
| **Document** | `C:\Users\aswat\Downloads\Projects\mobile-vet-report\content\final_turn_001.md`, copied into this directory as `spine-report.md` |
| **URL** | none — an internal deliverable, not a web page |

**Anchors in `localities.json`:** cost per clustered visit **Rs 850** and the scattered cost
Rs 1,498; the hard blended-price floor **Rs 1,100**; the travel constants (31 min 15 s per 10 km
average, 41 min 6 s evening peak, 21 min travel + 25 min clinical work per clustered visit, 37
min scattered travel); the **our_mix service ladder** (chronic-care review Rs 1,399, senior
wellness bundle Rs 2,499, home end-of-life with aftercare Rs 8,900, licence-compliance bundle
Rs 1,299, general consultation Rs 699 as off-peak filler only, chronic recheck Rs 1,199, home
diagnostics Rs 1,899) and the market ladder it observed; the feasible ceiling of six visits a
day on one route; the active-licence and campaign constants; and the seasonal, hour and weekday
reasoning behind the indices. Its 83 reference URLs are the source list for sections 4, 5 and 6
above.

## 8. Sources that do **not** exist for this zone (stated so the gap is visible)

- **Pet-ownership rate.** No Chennai or India household-survey figure for the share of
  households owning a pet was loaded. The animal rates are therefore tier C, and the reviewer's
  sanity band (15–30% of households owning a pet) is met by construction, not by observation.
- **Rent or sale price per sqft.** No listing page was loaded for the fifty localities. The
  affluence index (0.55–0.96) is a modelled tier C construct from built form and corridor
  position; it is the only input to the price modifier and nothing in the dataset verifies it.
- **Resident welfare associations.** No RWA with a published pet-management programme was
  returned. `cluster_assets.pet_friendly_associations` is a tier C lower bound, set to 1 for
  sixteen localities and 0 elsewhere.
- **Per-operator ratings and review counts** (see section 6).
- **GCB/Census household counts by ward** (see section 1).
