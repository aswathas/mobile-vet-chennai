# Brief — locality-level demand research for a mobile veterinary house-call service, Chennai

Read this file in full before doing anything. Then read the spine report at
`C:\Users\aswat\Downloads\Projects\mobile-vet-report\content\final_turn_001.md`
(it is also copied into your working directory as `spine-report.md`). The spine report
carries the market spine. Do not contradict it. Extend it to the locality level.

## Who this is for

An internal R&D team deciding where to place a mobile veterinary service in Chennai.
The output must be defensible enough that the team can commit capital and staff to a
locality. Numbers matter more than prose in this deliverable, but every number must
carry a provenance tier.

## The four output files (write all four into your working directory)

1. `localities.json` — the dataset. Exact schema below. This is the primary artifact.
2. `SOURCES.md` — every tier A and tier B claim, with its URL and how it was used.
3. `MODEL.md` — the demand model. Formulas, parameters, calibration, assumptions, limitations.
4. `ANALYSIS.md` — data-driven notes per zone, not finished prose. Numbers, rankings,
   anomalies, caveats. The main agent writes the final narrative.

## Research method, in this order

1. **Web first.** Use web search and fetch if your tools support it. Target, in priority order:
   - Chennai Corporation ward boundaries, GCC pet-licence and pet-registration pages, GCC
     free vaccination and birth-control centre locations (11 centres) and which ward each covers.
   - Census 2011 ward-level population and household counts, ward names, assembly constituencies.
   - Apartment and gated-community inventory: builder project pages, society listings, housing
     portals, "gated community" and "apartments for sale" listing counts per locality.
   - Veterinary supply: Justdial vet and vet-hospital listing pages for Chennai, PetCare.AI
     directory, Petter, Little Angels, Vetic, EASZO, ThePetNest, and standalone house-call vets.
     Capture price, rating, review count, locality.
   - Affluence proxies: rent or sale price per sqft for the locality, school and hospital tier,
     mall or retail presence, gated-community premium, IT-corridor proximity.
   - Traffic and corridor data for travel-time estimates.
   - GCC mass vaccination campaign timing (Aug to Oct 2026) and its effect on annual demand.
2. **Model what you cannot source.** If web access fails or a fact is missing, derive it
   and mark it tier C. Never leave a field empty. Use `null` only when the field is genuinely
   not applicable, and say so in `basis`.
3. **Never invent a URL.** If you did not actually load a page, the claim is not tier A.
   A URL you believe exists but did not load is tier B at best, and only if you name it as
   "unverified pointer".

## Provenance tiers (every cell that contains a number)

- **A** — Sourced. You loaded a page or read a document. Cite the URL.
- **B** — Derived. Computed from tier A inputs by a formula stated in `MODEL.md`.
  The formula and its inputs are listed.
- **C** — Modelled. An informed estimate. `MODEL.md` states the assumption, its
  rationale, and its uncertainty band.

Never blend A and C inside one number without saying so. A number derived from a tier C
input is tier C.

## The two service mixes (both required for every locality)

Both mixes are modelled at the same locality. Keep them in separate columns.

- **market_mix** — the full observed market: every service line Chennai operators sell,
  at the prices and volume mix the market actually carries.
- **our_mix** — what this practice would sell. The spine report's bet: chronic and
  geriatric care under continuity, senior wellness bundles, at-home end-of-life care with
  aftercare, and licence-compliance bundles. General consultation appears only as an
  off-peak filler at Rs 699 and never as the value line.

Our mix must be evaluated against the spine's economics: cost per clustered visit about
Rs 850, hard blended-price floor Rs 1,100, feasible ceiling about six visits a day on one
route. Report the serviceable ceiling as demand capacity, then state what one route and
what two routes could carry from that locality.

## Fixed constants from the spine report (use these, do not re-derive)

- Chennai active pet licences: 68,736 (12 May 2026). Issued to date: 78,392. Not renewed: 9,656.
  A later June 2026 statement put unrenewed near 13,200 and about 1 lakh dogs microchipped.
- GCC free supply: 11 centres. Mass campaign 11 Aug to 21 Oct 2026 vaccinated 1,50,303 dogs
  against a 2,00,000 target. Licence costs Rs 50, valid one year, Rs 5,000 penalty from 16 Jun 2026.
- Observed home-visit price ladder: Rs 200, Rs 299, Rs 399, Rs 499, Rs 599, Rs 699, Rs 899,
  Rs 999, Rs 1,199, Rs 1,699, Rs 1,999. Home euthanasia median Rs 6,800, clinic median Rs 2,800.
- Traffic: 31 min 15 s per 10 km average, 41 min 6 s evening peak. Worst corridor speeds
  1.5 km/h on the T. Nagar, Panagal Park, Kathipara corridors. Congestion worst 2:45 to 4:15 pm.
- Chennai veterinary supply: 413+ vet listings, 165+ vet hospitals, 284 clinics on a second
  directory, 8,529 registered practitioners in Tamil Nadu at 31 Mar 2026.

## Seasonality (required)

Give every locality a 12-month index, 100 = the annual average month. Chennai specifics:
- March to June: heat. Heat constrains animal transit to clinic, which raises the value of
  home visits, but outdoor visit windows shorten and staff fatigue rises.
- July to September: southwest monsoon, humidity and rain cut visit capacity further.
- October to December: north-east monsoon and the GCC mass campaign window. Campaign months
  are acquisition months, not revenue months.
- January and February: post-campaign renewal demand plus best weather. Peak revenue months.
Localities differ. An apartment cluster with indoor parking and a covered lobby tolerates a
summer visit that an open-layout locality does not. Apply that difference.

## Peak cover

For every locality, `peak_cases_per_day` is the maximum plausible cases in that locality on a
single day at seasonal peak. Define it in `peak_cover_definition`. Do not confuse peak
demand with serviceable capacity.

## Hour curve

24 buckets, key "00" to "23", each a share of the locality's daily demand, summing to 1.0.
Give the peak window. State the bookable window separately. The spine report argues for a
bookable window of 10:00 to 16:00 and against a 10:00 to 19:00 day that overlaps peak
congestion. Where the hour curve says otherwise for a locality, say so.

## Weekday split

Seven keys, "Mon" to "Sun", summing to 1.0. Give weekend uplift against the weekday average.
Account for: Saturday and Sunday are the days apartment associations can convene and when
owners are home; Monday is a working day when owners are not; veterinary emergencies skew
evenings and nights; the GCC 8 am to 3 pm centre hours push licence work into weekday
daytime.

## Economics per locality

For both mixes:
- monthly revenue potential
- revenue per visit
- revenue per weekday, seven values
- revenue per route-hour

Revenue per route-hour needs an honest route-hour number. Clustered round trips average
about 6.7 km per visit at 21 minutes of travel per 25 minutes of clinical work. Scattered
citywide round trips average about 12 km per visit at 37 minutes of travel per 25 minutes
of clinical work. Use the clustered figure for localities in a route cluster and say when
you use the scattered figure instead.

## Competition (required per locality)

Name the actual operators and clinics present in or immediately serving that locality:
house-call vets, clinic home-visit arms, platform operators, corporate mobile units,
GCC free centres, NGO clinics. For each: name, type, observed price where published, rating
and review count where published, URL, tier. Give a `saturation_index` from 0 to 100, where
100 means the locality is saturated with veterinary supply.

## Verdict per locality

`status` is GO, HOLD, or NO-GO. `reason` is one line with a number in it. `rank` is the
1-based rank inside the zone. `confidence` is high, medium, or low.

## Output format rules

- English. Indian units. Rs, lakh, crore. NSE-style number formatting (1,19,999).
- One JSON file, valid JSON, no comments, no trailing commas, no markdown fences.
- Numbers as numbers, not strings. Percentages as numbers with the field name saying pct.
- `null` only where genuinely not applicable, with a reason in the adjacent `basis` field.
- Write the files, then verify the JSON parses before you finish.

## Exact schema

```json
{
  "zone": "A",
  "zone_name": "South-East cluster",
  "hub": { "name": "", "lat": 0, "lon": 0, "rationale": "" },
  "generated_note": "",
  "localities": [
    {
      "id": "A01",
      "name": "",
      "aliases": [],
      "ward": "",
      "assembly_constituency": "",
      "pin_codes": [],
      "lat": 0,
      "lon": 0,
      "locality_type": "apartment-cluster|residential|mixed|commercial|industrial",
      "travel_km_to_hub": 0,
      "travel_min_to_hub": 0,
      "route_cluster": "A-R1",
      "population": { "households": 0, "tier": "A|B|C", "basis": "" },
      "pet_base": {
        "pet_households": 0,
        "dogs": 0,
        "cats": 0,
        "other_pets": 0,
        "licensed_pets": 0,
        "unlicensed_pets": 0,
        "license_penetration_pct": 0,
        "tier": "A|B|C",
        "basis": ""
      },
      "demand": {
        "cases_per_month_total": 0,
        "cases_per_week_avg": 0,
        "peak_cases_per_day": 0,
        "peak_cover_definition": "",
        "tier": "A|B|C",
        "basis": ""
      },
      "seasonality": { "index": { "Jan": 100, "Feb": 100, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0, "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0 }, "basis": "" },
      "weekday": { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 },
      "weekend_uplift_pct": 0,
      "hour_curve": { "00": 0, "01": 0, "02": 0, "03": 0, "04": 0, "05": 0, "06": 0, "07": 0, "08": 0, "09": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0, "16": 0, "17": 0, "18": 0, "19": 0, "20": 0, "21": 0, "22": 0, "23": 0 },
      "peak_window": { "start": "", "end": "" },
      "price": {
        "market_mix": { "avg_visit_price": 0, "service_lines": [ { "line": "", "price": 0, "share_pct": 0 } ], "monthly_spend_per_customer": 0, "tier": "A|B|C", "basis": "" },
        "our_mix": { "avg_visit_price": 0, "blended_price": 0, "service_lines": [ { "line": "", "price": 0, "share_pct": 0 } ], "monthly_spend_per_customer": 0, "tier": "A|B|C", "basis": "" }
      },
      "economics": {
        "market_mix": { "monthly_revenue_potential": 0, "revenue_per_visit": 0, "revenue_per_weekday": { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 }, "revenue_per_route_hour": 0 },
        "our_mix": { "monthly_revenue_potential": 0, "revenue_per_visit": 0, "revenue_per_weekday": { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 }, "revenue_per_route_hour": 0 },
        "serviceable_ceiling": { "one_route": { "cases_per_month": 0, "monthly_revenue": 0, "contribution": 0 }, "two_route": { "cases_per_month": 0, "monthly_revenue": 0, "contribution": 0 } },
        "cost_per_visit_clustered": 850,
        "blended_floor": 1100
      },
      "competition": {
        "competitor_count": 0,
        "saturation_index": 0,
        "named": [ { "name": "", "type": "house-call|clinic-home-arm|platform|corporate-mobile|public-ngo", "price_observed": 0, "rating": 0, "reviews": 0, "url": "", "tier": "A|B|C" } ]
      },
      "cluster_assets": { "apartment_complexes": 0, "gated_communities": 0, "pet_friendly_associations": 0, "notable_clusters": [], "tier": "A|B|C", "basis": "" },
      "travel": { "inter_locality_travel_min": 0, "services_per_trip_possible": 0, "scattered_or_clustered": "clustered|scattered", "notes": "" },
      "verdict": { "status": "GO|HOLD|NO-GO", "reason": "", "rank": 0, "confidence": "high|medium|low" }
    }
  ],
  "zone_summary": {
    "locality_count": 0,
    "total_households": 0,
    "total_pet_households": 0,
    "total_cases_per_month": 0,
    "our_mix_monthly_revenue_potential": 0,
    "top_go_localities": [ { "name": "", "reason": "" } ],
    "avoid_localities": [ { "name": "", "reason": "" } ],
    "route_clusters": [ { "id": "A-R1", "localities": [], "anchor": "", "cases_per_month": 0, "monthly_revenue": 0, "notes": "" } ],
    "staffing_by_hour": [ { "hour": "10", "visits": 0, "staff": 0 } ],
    "key_caveats": []
  }
}
```
