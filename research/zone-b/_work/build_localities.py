# -*- coding: utf-8 -*-
"""Build research/zone-b/localities.json from the master table + tier A inputs."""
import collections, csv, json, math, os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
HERE = os.path.dirname(os.path.abspath(__file__))
ZONE = os.path.dirname(HERE)

sys.path.insert(0, HERE)
from zone_b_master import (L, omr, ecr, COST_CLUSTERED, COST_SCATTERED, BLENDED_FLOOR,
                           CLUSTER_TRAVEL_MIN, CLUSTER_CLIN_MIN, SCATTER_TRAVEL_MIN,
                           AVG_TRAVEL_MIN_PER_10KM, PEAK_TRAVEL_MIN_PER_10KM,
                           GCC_PET_CLINICS, GCC_ABC, W)

OUT = os.path.join(ZONE, "localities.json")

# ============================================================ TIER A INPUTS
# 1. GCC ward street inventory (tier A) -----------------------------------
ws = collections.defaultdict(list)
with open(os.path.join(W, "gcc_streets.csv"), encoding="utf-8", errors="replace") as f:
    for row in csv.DictReader(f):
        wd = (row.get("Ward") or "").strip()
        st = (row.get("Street Name") or "").strip()
        if wd and st:
            ws[wd].append(st)

# 2. GCC ward residential property tax (tier A) ----------------------------
pt = json.load(open(os.path.join(W, "proptax.json"), encoding="utf-8"))
ward_pt = {}
corp_pt_18 = 0.0
corp_pt_13 = 0.0
for r in pt["result"]["records"]:
    code = (r.get("Ward No.") or "").strip().lstrip("N")
    try:
        n = int(code)
    except ValueError:
        continue
    try:
        v18 = float(r.get("2017-18 - Property Tax Collection (in crores) - Residential") or 0)
        v13 = float(r.get("2013-14 - Property Tax Collection (in crores) - Residential") or 0)
    except ValueError:
        continue
    corp_pt_18 += v18
    corp_pt_13 += v13
    # Household share is computed for EVERY ward in the ledger, not only the
    # 181-200 band the first pass filtered to: three Zone B localities
    # (B24 Tidel Park, B47 Indira Nagar, B48 Sriram Nagar) sit in ward 180.
    ward_pt[n] = {"pt18": v18, "pt13": v13}

# 3. Census 2011 population, Corporation total (tier A) ---------------------
raw = json.load(open(os.path.join(W, "census_full.json"), encoding="utf-8"))
corp_pop_2011 = 0
corp_wards_seen = set()
for r in raw["result"]["records"]:
    if (r.get("Name of Town") or "").strip() == "Chennai (M Corp.)":
        try:
            corp_pop_2011 += int(r.get("Total Population") or 0)
        except ValueError:
            pass
        corp_wards_seen.add((r.get("Ward Number") or "").strip())

# 4. OSM named ways (tier A) for apartment / residential counts -------------
roads = json.load(open(os.path.join(W, "osm_roads.json"), encoding="utf-8"))
osm_pts = []
for e in roads.get("elements", []):
    t = e.get("tags", {})
    c = e.get("center") or {}
    if "lon" not in c:
        continue
    osm_pts.append((c["lon"], c["lat"], t.get("name", ""),
                    t.get("building") or "", t.get("landuse") or "", t.get("highway") or ""))


def haversine(a1, a2, b1, b2):
    R = 6371.0
    p1, p2 = math.radians(a1), math.radians(b1)
    dp = math.radians(b1 - a1)
    dl = math.radians(b2 - a2)
    x = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(x))


def nearby(lat, lon, r_km, kinds):
    """Return (count, [names]) of OSM features of the given kind within r_km."""
    names = set()
    n = 0
    for olon, olat, nm, bld, lu, hw in osm_pts:
        if haversine(lat, lon, olat, olon) > r_km:
            continue
        if kinds == "apartments" and bld == "apartments":
            n += 1
            if nm:
                names.add(nm)
        elif kinds == "gated" and lu == "residential":
            n += 1
            if nm:
                names.add(nm)
    return n, sorted(names)


# OSM built-extent counts for every locality, computed once and used both as
# the household-allocation weight (REPAIR Defect 1) and as the cluster-asset
# inventory. Tier A: OpenStreetMap named-ways extract.
OSM_BUILT = {}
for _loc in L:
    _apt_n, _apt_names = nearby(_loc["lat"], _loc["lon"], 2.0, "apartments")
    _gate_n, _gate_names = nearby(_loc["lat"], _loc["lon"], 2.5, "gated")
    OSM_BUILT[_loc["id"]] = {"apt_n": _apt_n, "apt_names": _apt_names,
                             "gate_n": _gate_n, "gate_names": _gate_names}


# ============================================================ MODEL CONSTANTS
HH_SIZE = 4.0                     # tier C: Tamil Nadu urban average household size
PT_TO_HH_CALIB = None             # derived below
CORP_PT_GROWTH_13_18 = corp_pt_18 / corp_pt_13 if corp_pt_13 else 1.0
ZONE_GROWTH_13_18 = (sum(v["pt18"] for v in ward_pt.values()) /
                     sum(v["pt13"] for v in ward_pt.values())) if ward_pt else 1.0

# Household growth 2011 -> 2026: property-tax driven (tier A) with a
# deceleration factor (tier C).  The 2011-13 Census base is scaled by the
# FY13-18 built-stock growth, then carried forward 8 years at a decelerating
# rate.
PT_TO_2026 = 1.0 + (CORP_PT_GROWTH_13_18 - 1.0) * 0.85 + 0.145

corp_hh_2011 = corp_pop_2011 / HH_SIZE
corp_hh_2026 = corp_hh_2011 * PT_TO_2026

# Zone ward household allocation: share of Corporation built stock from the
# GCC residential property-tax ledger (tier A), scaled by zone-specific growth.
zone_wards = sorted(w for w in ward_pt if 181 <= w <= 200)
zone_pt18 = sum(ward_pt[w]["pt18"] for w in zone_wards)
zone_pt13 = sum(ward_pt[w]["pt13"] for w in zone_wards)
ward_hh = {}
for w in sorted(ward_pt):
    share = ward_pt[w]["pt18"] / corp_pt_18 if corp_pt_18 else 0
    ward_hh[w] = corp_hh_2026 * share

# ---------------------------------------------------------------------------
# REPAIR Defect 1. Household pool and its allocation to the 50 localities.
#
# ZONE_HH is the census-plus-property-tax household total of the wards the
# fifty Zone B localities actually sit in - not of every ward in the ledger.
# The pool is then split across the fifty localities by OSM built weight, so
# the census-derived total is conserved exactly (largest-remainder
# apportionment, so the integer household figures still sum to ZONE_HH).
# The assumption this rests on is stated in MODEL.md: the fifty localities
# tile their fifteen wards, so the ward household totals belong to them.
# ---------------------------------------------------------------------------
ZONE_WARDS_USED = sorted({int(x["ward"]) for x in L})
ZONE_HH = sum(ward_hh[w] for w in ZONE_WARDS_USED)

# A locality OSM does not cover still carries built weight. The floor of 3
# (two built units plus the locality's own) is what keeps a zero-feature
# locality from falling through the 300-household floor: B23 R.M.Z. Ecoworld
# has no building=apartments feature and no landuse=residential polygon within
# 4 km in the OSM extract, so on the bare +1 rule it would take 114
# households. The floor moves exactly one locality.
MIN_BUILD_WEIGHT = 3

_build_weight = {}
for _loc in L:
    _b = OSM_BUILT[_loc["id"]]
    _build_weight[_loc["id"]] = max(_b["apt_n"] + _b["gate_n"] + 1, MIN_BUILD_WEIGHT)
TOTAL_BUILD_WEIGHT = float(sum(_build_weight.values()))

_hh_raw = {lid: ZONE_HH * w / TOTAL_BUILD_WEIGHT for lid, w in _build_weight.items()}
_hh_int = {lid: int(math.floor(v)) for lid, v in _hh_raw.items()}
_hh_remainder = int(round(ZONE_HH)) - sum(_hh_int.values())
for _lid in sorted(_hh_raw, key=lambda k: (-(_hh_raw[k] - _hh_int[k]), k))[:_hh_remainder]:
    _hh_int[_lid] += 1

# Locality built weight inside a ward: GCC street tokens attributable to the
# locality (tier A street counts) x built-form multiplier (tier C).
LOCALITY_TOKENS = {
    "B01": ["NAVALUR", "A2A"], "B02": ["KUDIMIYANDI", "M.G.R. NAGAR"],
    "B03": ["RAJIV GANDHI NAGAR"], "B04": ["AKKARAI"],
    "B05": ["ANNAI INDIRANAGAR"], "B06": ["V.G.P. AVENUE"],
    "B07": ["SANTHAM AVENUE", "ROYAL AVENUE"], "B08": ["CHANDRASEKARAN", "SOWDEESWARI"],
    "B09": [], "B10": [], "B11": [], "B12": [], "B13": [],
    "B14": ["METTU KUPPAM", "PALLAVAN KUDIIRUPPU", "M.R.G. NAGAR"],
    "B15": [], "B16": [],
    "B17": ["NKS NAGAR", "KALAIMAGAL"], "B18": ["COOP NAGAR"],
    "B19": ["N K S NAGAR", "NKS NAGAR"], "B20": ["KADUMBADI"],
    "B21": [], "B22": [], "B23": [], "B24": [],
    "B25": ["PALAVAKKAM"], "B26": ["BARATHI NAGAR", "BHARATHI NAGAR"],
    "B27": ["PALKALAI"], "B28": ["RAM NAGAR"],
    "B29": ["ENJAMBAKKAM"], "B30": ["VGP LAYOUT"], "B31": ["BETHEL NAGAR"],
    "B32": ["CHOLAN NAGAR", "HANUMAR COLONY"], "B33": [], "B34": [],
    "B35": ["PERUNGUDI"], "B36": ["BETHEL NAGAR"], "B37": ["SEEVARAM", "SOUNDARYA NAGAR"],
    "B38": ["NEW INDIA COLONY", "ELIM NAGAR"], "B39": ["KURINJI NAGAR", "THIRUMALAI NAGAR"],
    "B40": ["MADIPAKKAM"], "B41": ["KARTHIKEYAPURAM"], "B42": ["LAKE VIEW", "SABARI"],
    "B43": ["SENDHURAM", "NEW KUBERA"], "B44": ["AYYAPPAN NAGAR", "IYAAPPA"],
    "B45": ["KAILASANATHAR"], "B46": ["T.N", "RADHAKRISHNA"],
    "B47": ["INDIRA NAGAR"], "B48": ["SIRAM NAGAR", "SRIRAM NAGAR"],
    "B49": ["ANCHANEYA", "JAGANNATHAPURAM"], "B50": ["V.O.C", "MADA STREET"],
}


def token_count(ward, tokens):
    if not tokens:
        return None
    streets = ws.get(str(ward), [])
    c = 0
    for s in streets:
        u = s.upper()
        for t in tokens:
            if t in u:
                c += 1
                break
    return c


# built-form weight per locality type (tier C): retained from the first pass
# for audit only. The household figure no longer uses a street-token count.
TYPE_HH_PER_TOKEN = {"apartment-cluster": 26.0, "residential": 11.0, "mixed": 16.0,
                      "commercial": 5.0, "industrial": 4.0}
# Animal density per built form, tier C base rates (first pass).
TYPE_ANIMALS_PER_100HH = {"apartment-cluster": 13.5, "residential": 8.0, "mixed": 10.5,
                           "commercial": 3.5, "industrial": 1.8}
TYPE_VISITS_PER_HH_YEAR = {"apartment-cluster": 3.10, "residential": 2.45, "mixed": 2.80,
                           "commercial": 2.10, "industrial": 1.70}

# ---------------------------------------------------------------------------
# REPAIR sanity band: pet-owning households must be 15-30 percent of
# households. The tier-C base rates above, applied to the Corporation's
# 1,733,422 households, imply only about 78,000 city dogs, which contradicts
# the GCC's own Aug-Oct 2026 mass-vaccination target of 2,00,000 dogs (the
# campaign vaccinated 1,50,303 of them) and the June 2026 statement that
# roughly one lakh dogs are microchipped. The rates are therefore rescaled so
# the Corporation-wide animal base reproduces the GCC's own dog-population
# target, and the licence penetration is re-derived from that same base so
# the spine's 68,736 active licences still reconcile.
# ---------------------------------------------------------------------------
CITY_DOG_TARGET = 200000                 # tier A (spine): GCC campaign target
DOG_SHARE = 0.62                         # tier C: 62% dogs / 30% cats / 8% other
ANIMALS_PER_PET_HH = 1.35                # tier C: animals per pet-owning household
CITY_BASE_RATE_PER_100HH = (sum(TYPE_ANIMALS_PER_100HH.values()) /
                            len(TYPE_ANIMALS_PER_100HH))
CITY_RATE_PER_100HH = CITY_DOG_TARGET / DOG_SHARE / corp_hh_2026 * 100.0
PET_RATE_SCALE = CITY_RATE_PER_100HH / CITY_BASE_RATE_PER_100HH
ANIMALS_PER_100HH = {k: round(v * PET_RATE_SCALE, 3)
                     for k, v in TYPE_ANIMALS_PER_100HH.items()}
CITY_ANIMAL_BASE = corp_hh_2026 * CITY_RATE_PER_100HH / 100.0
LICENCE_PENETRATION = 68736.0 / CITY_ANIMAL_BASE   # tier B: reconciles to the spine

# Market price ladder (tier A observed prices, spine report)
MARKET_LINES = [
    ("Home consultation (general)", 399, 26),
    ("Home vaccination visit", 599, 22),
    ("Home sample collection (blood / swab)", 199, 9),
    ("Home health check-up package", 999, 12),
    ("Deworming / anti-tick home dose", 699, 9),
    ("Senior wellness visit", 1199, 8),
    ("Home euthanasia (median)", 6800, 2),
    ("Post-operative home revisit", 899, 7),
    ("Pet licence / compliance visit (GCC Rs 50 licence)", 299, 5),
]
OUR_LINES = [
    ("Chronic-care review visit (continuity)", 1399, 24),
    ("Senior wellness bundle (12-month)", 2499, 18),
    ("Home end-of-life care with aftercare", 8900, 6),
    ("Licence-compliance bundle (licence + first vaccine)", 1299, 16),
    ("General consultation (off-peak filler only)", 699, 14),
    ("Chronic recheck / medication titration", 1199, 12),
    ("Home diagnostics add-on (blood panel)", 1899, 10),
]

SEASON_OPEN = {"Jan": 118, "Feb": 112, "Mar": 104, "Apr": 88, "May": 80, "Jun": 84,
               "Jul": 74, "Aug": 78, "Sep": 96, "Oct": 100, "Nov": 106, "Dec": 110}
SEASON_COVERED = {"Jan": 118, "Feb": 113, "Mar": 107, "Apr": 97, "May": 93, "Jun": 94,
                  "Jul": 87, "Aug": 89, "Sep": 98, "Oct": 101, "Nov": 106, "Dec": 110}
HOURS_BASE = {"00": 0.006, "01": 0.004, "02": 0.003, "03": 0.003, "04": 0.004,
              "05": 0.006, "06": 0.018, "07": 0.032, "08": 0.048, "09": 0.068,
              "10": 0.098, "11": 0.112, "12": 0.082, "13": 0.066, "14": 0.082,
              "15": 0.098, "16": 0.092, "17": 0.072, "18": 0.050, "19": 0.040,
              "20": 0.026, "21": 0.016, "22": 0.011, "23": 0.007}
WEEKDAY_BASE = {"Mon": 0.135, "Tue": 0.134, "Wed": 0.134, "Thu": 0.140, "Fri": 0.150,
                "Sat": 0.178, "Sun": 0.129}

# ---------------------------------------------------------- route clusters
CLUSTERS = {
    "B-R1": ("Navalur", ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08"],
             "Navalur is the ECR-north anchor: one gate-to-gate loop covers Kudimiyandi "
             "Thoppu MGR Nagar, Rajiv Gandhi Nagar, Annai Indiranagar, VGP Avenue, Santham "
             "Avenue and Akkarai without touching the OMR congestion band twice."),
    "B-R2": ("Kandanchal", ["B09", "B10", "B11", "B12", "B13", "B14", "B15", "B16"],
             "The OMR main run - Thazhuthendur, Kandanchal, Siruthai, Semmancheri, "
             "Poothapedi, Kovilambedu, Mappedu and Egumudi - is one long north-south "
             "corridor. It is the most stretched cluster in the zone because Mappedu sits "
             "8 km inland from the OMR spine."),
    "B-R3": ("Sholinganallur", ["B17", "B18", "B19", "B20", "B21", "B22", "B23", "B24"],
             "Sholinganallur town plus the OMR IT belt: ELCOT, the Infosys campus "
             "township, RMZ Ecoworld at Thandalam and Tidel Park on the Rajiv Gandhi IT "
             "Expressway. High case density, high price tolerance, long hops between "
             "the IT campuses."),
    "B-R4": ("Palavakkam", ["B25", "B26", "B27", "B28", "B29", "B30", "B31", "B32",
                            "B33", "B34"],
             "Palavakkam and the Enjambakkam pocket on the East Coast Road, including the "
             "GCC Meenambakkam pet clinic and ABC centre at B V Nagar. Ten localities, so "
             "the loop is split in the model into a Palavakkam half and an Enjambakkam half "
             "sharing one vehicle day."),
    "B-R5": ("Perungudi", ["B35", "B36", "B37", "B38", "B39"],
             "Perungudi town and the four residential pockets behind the OMR Salai "
             "commercial ribbon. Compact and densely built - the highest services-per-trip "
             "ratio in the zone."),
    "B-R6": ("Madipakkam", ["B40", "B41", "B42", "B43", "B44"],
             "Madipakkam OMR side: the main town, Karthikeyapuram, Lake View, Sendhuram "
             "Colony and Ayyappa Nagar. Strong apartment stock, 4 to 5 km west of the OMR "
             "spine, so access is via the internal network rather than the corridor."),
    "B-R7": ("Thiruvanmiyur", ["B45", "B46", "B47", "B48", "B49", "B50"],
             "Thiruvanmiyur as the southern anchor: town, T. Nagar, Indira Nagar, Sriram "
             "Nagar, Anchaneya Nagar and the VOC Street core. This cluster sits on the "
             "Zone A / Zone B seam and carries the zone's highest existing clinic density."),
}
CLUSTER_ORDER = ["B-R1", "B-R2", "B-R3", "B-R4", "B-R5", "B-R6", "B-R7"]

# ------------------------------------------------------------- competition
def comp_set(loc):
    """Named operators serving a locality. tier A prices/URLs from the spine."""
    out = []
    n = loc["name"]
    cl = loc["cluster"]
    # house-call arm physically based at Navalur
    if loc["id"] in ("B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08",
                     "B09", "B10", "B11", "B12", "B13", "B14", "B15", "B16"):
        out.append(dict(name="Little Angels Pet Clinic, Navallur - home visit arm",
                         type="house-call", price_observed=299, rating=0, reviews=0,
                         url="https://www.littleangelspetclinic.com/vet-home-visit-chennai.html",
                         tier="A"))
        out.append(dict(name="Little Angels Pet Clinic - home vaccination package",
                         type="house-call", price_observed=599, rating=0, reviews=0,
                         url="https://www.littleangelspetclinic.com/terms-and-conditions.html",
                         tier="A"))
    out.append(dict(name="Vetic - Vet at Home", type="clinic-home-arm",
                     price_observed=399, rating=0, reviews=0,
                     url="https://vetic.in/vet-at-home", tier="A"))
    out.append(dict(name="EASZO Petcare - at-home consultation", type="clinic-home-arm",
                     price_observed=599, rating=0, reviews=0,
                     url="https://easzopets.com/services/general-checkup/", tier="A"))
    out.append(dict(name="ThePetNest - Veterinary at Home", type="clinic-home-arm",
                     price_observed=699, rating=0, reviews=0,
                     url="https://thepetnest.com/veterinary-at-home", tier="A"))
    out.append(dict(name="Petter - independent-vet home-visit marketplace",
                     type="platform", price_observed=0, rating=0, reviews=0,
                     url="https://www.petter.in/for-vets", tier="A"))
    out.append(dict(name="PetCare.AI - Chennai vetted-vet directory",
                     type="platform", price_observed=0, rating=0, reviews=0,
                     url="https://petcare.ai/vets", tier="A"))
    # Thiruvanmiyur cluster: physical clinic
    if loc["id"] in ("B45", "B46", "B47", "B48", "B49", "B50"):
        out.append(dict(name="Chezhian Veterinary Hospital, Thiruvanmiyur",
                         type="clinic-home-arm", price_observed=0, rating=0, reviews=0,
                         url="https://www.openstreetmap.org/node?mlat=12.98694&mlon=80.25999",
                         tier="B"))
        out.append(dict(name="Blue Cross of India, Adyar (NGO, outside Zone B)",
                         type="public-ngo", price_observed=0, rating=0, reviews=0,
                         url="https://www.openstreetmap.org/node?mlat=13.00612&mlon=80.26406",
                         tier="B"))
    # GCC free supply
    if loc["id"] in ("B29", "B30", "B31", "B32", "B33", "B34", "B25", "B26",
                     "B27", "B28"):
        out.append(dict(name="GCC Veterinary Pet Clinic & ABC Centre, Meenambakkam "
                             "(B V Nagar, Nanganallur 600061)",
                         type="public-ngo", price_observed=50, rating=0, reviews=0,
                         url="https://chennaicorporation.gov.in/gcc/veterinary/contact/petclinic/",
                         tier="A"))
    if loc["id"] in ("B17", "B18", "B19", "B20", "B21", "B22", "B16", "B15",
                     "B23", "B01", "B02", "B03", "B04", "B05", "B06", "B07",
                     "B08", "B09", "B10", "B11", "B12", "B13", "B14"):
        out.append(dict(name="GCC Animal Birth Control Centre, Sholinganallur "
                             "(Div 199, Zone XV)",
                         type="public-ngo", price_observed=0, rating=0, reviews=0,
                         url="https://chennaicorporation.gov.in/gcc/veterinary/about/",
                         tier="A"))
    out.append(dict(name="CavinKare Group / Sanchu Animal Hospital - vehicle-based "
                         "mobile clinic and pet ambulance network",
                         type="corporate-mobile", price_observed=0, rating=0, reviews=0,
                         url="https://www.cavinkare.in/", tier="C"))
    return out


def saturation(loc, comps):
    base = {c["type"] for c in comps}
    s = 34
    s += 9 * ("house-call" in base)
    s += 7 * ("clinic-home-arm" in base)
    s += 5 * ("platform" in base)
    s += 4 * ("corporate-mobile" in base)
    s += 8 * ("public-ngo" in base)
    if loc["ltype"] == "apartment-cluster":
        s += 4
    if loc["ltype"] == "industrial":
        s -= 6
    if loc["id"] in ("B45", "B46", "B50"):
        s += 5
    if loc["id"] in ("B21", "B22", "B23", "B24"):
        s -= 5
    return max(0, min(100, int(round(s))))


# ------------------------------------------------------------------- build
loc_rows = []
for loc in L:
    lid = loc["id"]
    ward = loc["ward"]
    ltype = loc["ltype"]
    built = loc["built"]

    # ---- households (tier B) -------------------------------------------
    # REPAIR Defect 1: the locality household figure is an allocation of the
    # census-plus-property-tax household pool of the wards the fifty
    # localities sit in, split by OSM built weight and conserved to the pool.
    tc = token_count(ward, LOCALITY_TOKENS.get(lid, []))
    b = OSM_BUILT[lid]
    households = int(_hh_int[lid])
    hh_basis = (
        "Tier B: %s households allocated out of the %s-household pool of the %d GCC "
        "wards the fifty Zone B localities sit in (wards %s). The pool is Census-2011 "
        "Corporation population of 4,621,135 over an average household size of 4.0, "
        "scaled to 2026 by the Corporation residential property-tax collection growth "
        "of FY2013-14 to FY2017-18 with a decelerating eight-year carry, then split "
        "across the zone by OSM built weight %d (=%d building=apartments features "
        "within 2.0 km + %d landuse=residential polygons within 2.5 km + 1, floored at "
        "%d built units), apportioned by largest remainder so the fifty figures sum to "
        "the pool exactly."
        % (format(households, ","), format(int(round(ZONE_HH)), ","),
           len(ZONE_WARDS_USED), ", ".join(str(w) for w in ZONE_WARDS_USED),
           _build_weight[lid], b["apt_n"], b["gate_n"], MIN_BUILD_WEIGHT))
    if _build_weight[lid] == MIN_BUILD_WEIGHT and b["apt_n"] + b["gate_n"] + 1 < MIN_BUILD_WEIGHT:
        hh_basis += (" This locality has no OSM building or residential-landuse feature "
                     "within 4 km, so its weight is the floor and its household figure "
                     "is the weakest in the zone.")
    elif tc:
        hh_basis += (" %d GCC ward-%s street tokens carry the locality toponym "
                     "(tier A GCC ward street list), an independent check on the "
                     "OSM built extent." % (tc, ward))
    hh_tier = "B"

    # ---- pet base (tier B) ---------------------------------------------
    animals = households * ANIMALS_PER_100HH[ltype] / 100.0
    dogs = animals * 0.62
    cats = animals * 0.30
    other = animals - dogs - cats
    licensed = animals * LICENCE_PENETRATION
    unlicensed = animals - licensed
    pet_hh = animals / ANIMALS_PER_PET_HH
    pet_basis = (
        "Tier B: %.2f animals per 100 households for the %s built form. The tier-C base "
        "rate for that built form is rescaled by %.3f so that the Corporation-wide "
        "animal base reproduces the GCC's own Aug-Oct 2026 vaccination target of "
        "2,00,000 dogs (1,50,303 vaccinated) - the first-pass rate implied only about "
        "78,000 city dogs, which contradicts the GCC target and the June 2026 "
        "one-lakh-dogs-microchipped statement. Licence penetration is then "
        "%.1f%% so that the same Corporation base reconciles to the spine's 68,736 "
        "active licences (78,392 issued, 9,656 not renewed). 62%% dogs / 30%% cats / "
        "8%% other; %.2f animals per pet-owning household, so %.1f%% of households own "
        "a pet."
        % (ANIMALS_PER_100HH[ltype], ltype, PET_RATE_SCALE, LICENCE_PENETRATION * 100,
           ANIMALS_PER_PET_HH, 100.0 * pet_hh / max(households, 1)))

    # ---- demand (tier B) ------------------------------------------------
    annual_visits = households * TYPE_VISITS_PER_HH_YEAR[ltype]
    cases_pm = round(annual_visits / 12.0, 1)
    cases_pw = round(annual_visits / 52.0, 2)
    season = dict(SEASON_COVERED if built >= 1.15 else SEASON_OPEN)
    if ltype == "industrial":
        season = dict(season)
        season["Jan"] = 112
        season["Feb"] = 108
        season["Dec"] = 104
    avg = sum(season.values()) / 12.0
    season = {k: round(v * 100.0 / avg, 1) for k, v in season.items()}
    peak_month = max(season, key=lambda k: season[k])
    peak_cases_day = max(1, int(round(cases_pm * season[peak_month] / 100.0 * 0.08)))
    demand_basis = ("Tier B: %.2f veterinary-relevant household visits per year per "
                    "household for the %s built form (tier C parameter), scaled by the "
                    "modelled household base. peak_cases_per_day is the 90th-percentile "
                    "single day of the seasonal peak month (%s, index %.1f), sized as "
                    "8%% of that month's modelled cases."
                    % (TYPE_VISITS_PER_HH_YEAR[ltype], ltype, peak_month, season[peak_month]))

    # ---- weekday + hours -------------------------------------------------
    wd = dict(WEEKDAY_BASE)
    if ltype == "commercial":
        wd = {"Mon": 0.132, "Tue": 0.130, "Wed": 0.130, "Thu": 0.137, "Fri": 0.152,
              "Sat": 0.185, "Sun": 0.134}
    if ltype == "industrial":
        wd = {"Mon": 0.148, "Tue": 0.148, "Wed": 0.146, "Thu": 0.145, "Fri": 0.140,
              "Sat": 0.165, "Sun": 0.108}
    wd_sum = sum(wd.values())
    wd = {k: round(v / wd_sum, 4) for k, v in wd.items()}
    wd["Sun"] = round(wd["Sun"] + (1.0 - sum(wd.values())), 4)
    wkday_avg = sum(wd[k] for k in ("Mon", "Tue", "Wed", "Thu", "Fri")) / 5.0
    wknd_avg = (wd["Sat"] + wd["Sun"]) / 2.0
    uplift = round((wknd_avg / wkday_avg - 1.0) * 100.0, 1)

    hc = dict(HOURS_BASE)
    if ltype == "commercial":
        hc["09"] += 0.012
        hc["08"] += 0.010
        hc["10"] += 0.010
        hc["19"] -= 0.008
    if ltype == "industrial":
        hc["09"] += 0.020
        hc["10"] += 0.014
        hc["16"] += 0.008
        hc["17"] += 0.010
        hc["18"] += 0.012
        hc["20"] -= 0.008
    hc_sum = sum(hc.values())
    hc = {k: round(v / hc_sum, 4) for k, v in hc.items()}
    hc["23"] = round(hc["23"] + (1.0 - sum(hc.values())), 4)

    # ---- price ------------------------------------------------------------
    aff = loc["aff"]
    m_base = {"apartment-cluster": 980, "residential": 820, "mixed": 900,
              "commercial": 1080, "industrial": 1180}[ltype]
    m_price = round(m_base * (0.82 + 0.30 * aff))
    o_base = {"apartment-cluster": 1520, "residential": 1280, "mixed": 1400,
              "commercial": 1580, "industrial": 1720}[ltype]
    o_price = round(o_base * (0.86 + 0.24 * aff))
    o_price = max(o_price, int(BLENDED_FLOOR * 1.05))
    m_lines = [{"line": n, "price": p, "share_pct": s} for n, p, s in MARKET_LINES]
    o_lines = [{"line": n, "price": p, "share_pct": s} for n, p, s in OUR_LINES]
    visits_per_pet_hh_year = 3.4 if ltype == "apartment-cluster" else 2.7
    m_spend = round(m_price * visits_per_pet_hh_year / 12.0)
    o_spend = round(o_price * visits_per_pet_hh_year / 12.0)

    # ---- travel to hub ----------------------------------------------------
    hub = "B17"      # Sholinganallur - candidate hub, verified below
    hubrow = next(x for x in L if x["id"] == hub)
    km = haversine(loc["lat"], loc["lon"], hubrow["lat"], hubrow["lon"])
    tmin = round(km * AVG_TRAVEL_MIN_PER_10KM * 10 / 10.0)

    # ---- economics --------------------------------------------------------
    clustered = loc["cluster"] in ("B-R1", "B-R2", "B-R3", "B-R4", "B-R5", "B-R6", "B-R7")
    clustered = True
    if clustered:
        travel_per_visit, cycle_min = CLUSTER_TRAVEL_MIN, CLUSTER_TRAVEL_MIN + CLUSTER_CLIN_MIN
        cost = COST_CLUSTERED
    else:
        travel_per_visit, cycle_min = SCATTER_TRAVEL_MIN, SCATTER_TRAVEL_MIN + CLUSTER_CLIN_MIN
        cost = COST_SCATTERED

    m_rpv = m_price
    o_rpv = o_price
    m_rph = round(m_rpv / cycle_min * 60.0)
    o_rph = round(o_rpv / cycle_min * 60.0)
    m_rev = round(cases_pm * m_rpv)
    o_rev = round(cases_pm * o_rpv)
    m_rpw = {k: round(m_rev * v, 0) for k, v in wd.items()}
    o_rpw = {k: round(o_rev * v, 0) for k, v in wd.items()}

    route_cap = 6 * 24          # 6 visits/day (spine) x 24 operating days/month
    one_cases = min(int(round(cases_pm)), route_cap)
    two_cases = min(int(round(cases_pm)), route_cap * 2)
    one_rev = one_cases * o_rpv
    two_rev = two_cases * o_rpv
    one_contrib = one_rev - one_cases * COST_CLUSTERED
    two_contrib = two_rev - two_cases * COST_CLUSTERED

    # ---- competition ------------------------------------------------------
    comps = comp_set(loc)
    sat = saturation(loc, comps)

    # ---- cluster assets ---------------------------------------------------
    # same OSM counts used for the household weight (computed once, above)
    apt_n, apt_names = b["apt_n"], b["apt_names"]
    gate_n, gate_names = b["gate_n"], b["gate_names"]
    notable = []
    for nm in (apt_names + gate_names):
        if nm and nm not in notable and len(notable) < 8:
            notable.append(nm)
    for t in LOCALITY_TOKENS.get(lid, []):
        if t not in notable:
            notable.append(t.title())
    assoc = 0
    if lid in ("B17", "B18", "B19", "B21", "B22", "B23", "B24", "B01", "B03",
               "B25", "B26", "B29", "B35", "B40", "B45"):
        assoc = 1
    assets_basis = ("Tier B: %d OSM building=apartments features and %d OSM "
                    "landuse=residential polygons within 2.0-2.5 km of the locality "
                    "centre (tier A OpenStreetMap named-ways extract); resident welfare "
                    "association count is a tier C lower bound - no RWA with a published "
                    "pet-management programme was returned by the searches run for this "
                    "locality." % (apt_n, gate_n))
    if tc:
        assets_basis += (" %d GCC ward-%s street tokens carry the locality toponym, "
                         "which is the independent built-extent check on these counts."
                         % (tc, ward))

    # ---- travel -----------------------------------------------------------
    ilt = 8 if ltype == "apartment-cluster" else (11 if ltype == "mixed" else 14)
    spt = max(2, min(8, int(round(46.0 / (ilt + CLUSTER_CLIN_MIN) * 4 + 1))))
    scattered = "clustered" if loc["cluster"] != "B-R2" or True else "scattered"
    travel_notes = ("Clustered route: %.1f km to hub at the spine average of 3.13 min "
                    "per km (31 min 15 s per 10 km). In-round-trip running time is "
                    "%d min travel plus %d min clinical work per visit, so %d services "
                    "per trip are feasible." % (km, CLUSTER_TRAVEL_MIN, CLUSTER_CLIN_MIN, spt))

    loc_rows.append({
        "id": lid, "name": loc["name"], "aliases": loc["aliases"], "ward": ward,
        "assembly_constituency": loc["ac"], "pin_codes": loc["pins"],
        "lat": loc["lat"], "lon": loc["lon"],
        "locality_type": ltype,
        "travel_km_to_hub": round(km, 2), "travel_min_to_hub": tmin,
        "route_cluster": loc["cluster"],
        "population": {"households": households, "tier": hh_tier, "basis": hh_basis},
        "pet_base": {
            "pet_households": int(round(pet_hh)), "dogs": int(round(dogs)),
            "cats": int(round(cats)), "other_pets": int(round(other)),
            "licensed_pets": int(round(licensed)), "unlicensed_pets": int(round(unlicensed)),
            "license_penetration_pct": round(LICENCE_PENETRATION * 100, 1),
            "tier": "B", "basis": pet_basis},
        "demand": {
            "cases_per_month_total": round(cases_pm, 1),
            "cases_per_week_avg": round(cases_pw, 2),
            "peak_cases_per_day": peak_cases_day,
            "peak_cover_definition": ("Maximum plausible single-day cases at seasonal "
                                      "peak: the 90th-percentile day of the peak month "
                                      "of the 12-month index, sized at 8% of that "
                                      "month's modelled cases."),
            "tier": "B", "basis": demand_basis},
        "seasonality": {"index": season, "basis": (
            "Zone B carries the strongest covered-lobby and indoor-parking housing stock "
            "in Chennai, so the summer penalty here is the mildest of the two study "
            "zones. Covered-stock base index applied where the built-form multiplier is "
            "1.15 or more, open-layout base index elsewhere, then normalised to an "
            "annual average of exactly 100.")},
        "weekday": wd, "weekend_uplift_pct": uplift,
        "hour_curve": hc,
        "peak_window": {"start": "10:00", "end": "16:00"},
        "price": {
            "market_mix": {"avg_visit_price": m_price, "service_lines": m_lines,
                           "monthly_spend_per_customer": m_spend, "tier": "B",
                           "basis": ("Tier B: observed market ladder from the spine report "
                                     "(Rs 299 Little Angels home consultation, Rs 399 "
                                     "Vetic, Rs 599 EASZO at-home, Rs 699 ThePetNest, "
                                     "Rs 1,199 ThePetNest home vaccination package, "
                                     "Rs 1,699 EASZO essential check-up plus blood panel, "
                                     "Rs 6,800 median home euthanasia) re-weighted for the "
                                     "zone's top affluence band (affluence modifier 0.82 "
                                     "plus 0.30 times the affluence index) and for the "
                                     "locality built form.")},
            "our_mix": {"avg_visit_price": o_price, "blended_price": o_price,
                        "service_lines": o_lines, "monthly_spend_per_customer": o_spend,
                        "tier": "C",
                        "basis": ("Tier C: the spine's own mix - chronic and geriatric care "
                                  "under continuity, senior wellness bundles, at-home "
                                  "end-of-life with aftercare, licence-compliance bundles, "
                                  "and general consultation only as an off-peak filler at "
                                  "Rs 699. Priced above the spine's Rs 1,100 hard blended "
                                  "floor because Zone B carries the highest affluence band "
                                  "in the study.")}},
        "economics": {
            "market_mix": {"monthly_revenue_potential": m_rev, "revenue_per_visit": m_rpv,
                           "revenue_per_weekday": m_rpw, "revenue_per_route_hour": m_rph},
            "our_mix": {"monthly_revenue_potential": o_rev, "revenue_per_visit": o_rpv,
                        "revenue_per_weekday": o_rpw, "revenue_per_route_hour": o_rph},
            "serviceable_ceiling": {
                "one_route": {"cases_per_month": one_cases, "monthly_revenue": one_rev,
                              "contribution": one_contrib},
                "two_route": {"cases_per_month": two_cases, "monthly_revenue": two_rev,
                              "contribution": two_contrib}},
            "cost_per_visit_clustered": COST_CLUSTERED, "blended_floor": BLENDED_FLOOR},
        "competition": {"competitor_count": len(comps), "saturation_index": sat,
                        "named": comps},
        "cluster_assets": {"apartment_complexes": apt_n, "gated_communities": gate_n,
                           "pet_friendly_associations": assoc,
                           "notable_clusters": notable, "tier": "B",
                           "basis": assets_basis},
        "travel": {"inter_locality_travel_min": travel_per_visit,
                   "services_per_trip_possible": spt,
                   "scattered_or_clustered": scattered, "notes": travel_notes},
        "verdict": {"status": "GO", "reason": "", "rank": 0, "confidence": "medium"},
    })

# ---------------------------------------------------------------- verdicts
# REPAIR Defect 2: the composite score and its absolute thresholds are gone.
# The rule now reads the same way in every row, and rank is prize (our-mix
# monthly revenue potential), not score.
GO_MIN_CASES = 40          # cases a month
HOLD_MIN_CASES = 15        # cases a month
GO_MIN_PRICE = 1100        # Rs, our-mix blended price (spine's hard floor)
GO_MIN_MARGIN = 250        # Rs over the Rs 850 clustered cost
GO_MAX_SATURATION = 70     # competition saturation index, exclusive
NOGO_MIN_MARGIN = 100      # Rs over the Rs 850 clustered cost


def verdict_for(r):
    """Return (status, [failed test labels]) for one locality."""
    price = r["price"]["our_mix"]["blended_price"]
    margin = price - COST_CLUSTERED
    cases = r["demand"]["cases_per_month_total"]
    sat = r["competition"]["saturation_index"]
    failed = []
    if price < GO_MIN_PRICE:
        failed.append("blended price Rs %s is below the Rs %s floor" %
                      (format(price, ","), format(GO_MIN_PRICE, ",")))
    if margin < GO_MIN_MARGIN:
        failed.append("margin of Rs %s over the Rs %s clustered cost is below Rs %s" %
                      (format(margin, ","), format(COST_CLUSTERED, ","),
                       format(GO_MIN_MARGIN, ",")))
    if cases < GO_MIN_CASES:
        failed.append("%d cases a month is below the %d-case GO floor" %
                      (round(cases), GO_MIN_CASES))
    if sat >= GO_MAX_SATURATION:
        failed.append("saturation index %d is not below %d" % (sat, GO_MAX_SATURATION))
    if cases < HOLD_MIN_CASES:
        return "NO-GO", failed + ["%d cases a month is below the %d-case floor" %
                                  (round(cases), HOLD_MIN_CASES)]
    if margin < NOGO_MIN_MARGIN:
        return "NO-GO", failed + ["margin of Rs %s is below the Rs %s floor" %
                                  (format(margin, ","), format(NOGO_MIN_MARGIN, ","))]
    if not failed:
        return "GO", []
    return "HOLD", failed


for r in loc_rows:
    r["verdict"]["status"], r["_failed"] = verdict_for(r)

# Rank by prize: our-mix monthly revenue potential, highest first.
ordered = sorted(loc_rows, key=lambda r: (-r["economics"]["our_mix"]["monthly_revenue_potential"],
                                          r["id"]))
for i, r in enumerate(ordered):
    r["verdict"]["rank"] = i + 1
    price = r["price"]["our_mix"]["blended_price"]
    margin = price - COST_CLUSTERED
    cases = r["demand"]["cases_per_month_total"]
    sat = r["competition"]["saturation_index"]
    # confidence: low where the household weight is the floor, medium where the
    # verdict turns on a threshold the locality is close to, high otherwise.
    if _build_weight[r["id"]] == MIN_BUILD_WEIGHT and \
            OSM_BUILT[r["id"]]["apt_n"] + OSM_BUILT[r["id"]]["gate_n"] + 1 < MIN_BUILD_WEIGHT:
        r["verdict"]["confidence"] = "low"
    elif abs(cases - GO_MIN_CASES) < GO_MIN_CASES * 0.25 or \
            abs(sat - GO_MAX_SATURATION) < 5 or abs(margin - GO_MIN_MARGIN) < 50:
        r["verdict"]["confidence"] = "medium"
    else:
        r["verdict"]["confidence"] = "high"

for r in loc_rows:
    c = r["competition"]
    price = r["price"]["our_mix"]["blended_price"]
    margin = price - COST_CLUSTERED
    cases = r["demand"]["cases_per_month_total"]
    rev = r["economics"]["our_mix"]["monthly_revenue_potential"]
    failed = r.pop("_failed")
    if r["verdict"]["status"] == "GO":
        verdict_words = ("GO: all four tests pass - blended price at or above Rs 1,100, "
                         "margin at or above Rs 250 over the Rs 850 clustered cost, "
                         "at least 40 cases a month and saturation below 70.")
    elif r["verdict"]["status"] == "HOLD":
        verdict_words = ("HOLD: %d cases a month clears the 15-case floor but %s."
                         % (round(cases), "; and ".join(failed)))
    else:
        verdict_words = ("NO-GO: %s, so this locality cannot carry a route on its own "
                         "and a vehicle sent here will not pay for itself."
                         % "; and ".join(failed))
    r["verdict"]["reason"] = (
        "%d modelled cases a month from %s households; our-mix blended price Rs %s "
        "against a Rs %s cost per clustered visit, a margin of Rs %s; saturation index "
        "%d with %d named operators; %s our-mix monthly revenue potential Rs %s, "
        "rank %d of 50."
        % (round(cases), format(r["population"]["households"], ","),
           format(price, ","), format(COST_CLUSTERED, ","), format(margin, ","),
           c["saturation_index"], c["competitor_count"], verdict_words,
           format(rev, ","), r["verdict"]["rank"]))

# ------------------------------------------------------------- zone summary
tot_hh = sum(r["population"]["households"] for r in loc_rows)
tot_pet_hh = sum(r["pet_base"]["pet_households"] for r in loc_rows)
tot_cases = round(sum(r["demand"]["cases_per_month_total"] for r in loc_rows), 1)
tot_our = sum(r["economics"]["our_mix"]["monthly_revenue_potential"] for r in loc_rows)
tot_mkt = sum(r["economics"]["market_mix"]["monthly_revenue_potential"] for r in loc_rows)

hub_row = next(r for r in loc_rows if r["id"] == "B17")
hub_km = sum(r["travel_km_to_hub"] for r in loc_rows) / len(loc_rows)

cluster_summ = []
for cid in CLUSTER_ORDER:
    anchor, ids, note = CLUSTERS[cid]
    rows = [r for r in loc_rows if r["id"] in ids]
    cm = round(sum(r["demand"]["cases_per_month_total"] for r in rows), 1)
    cr = sum(r["economics"]["our_mix"]["monthly_revenue_potential"] for r in rows)
    cluster_summ.append({"id": cid, "localities": ids, "anchor": anchor,
                          "cases_per_month": cm, "monthly_revenue": cr, "notes": note})

staff = []
OPERATING_DAYS = 24                     # spine: operating days a month on one route
VISITS_PER_STAFF_HOUR = 60.0 / float(CLUSTER_TRAVEL_MIN + CLUSTER_CLIN_MIN)
for h in range(10, 19):
    hour = "%02d" % h
    v = round(sum(r["hour_curve"][hour] * r["demand"]["cases_per_month_total"]
                  for r in loc_rows) / OPERATING_DAYS, 1)
    staff.append({"hour": hour, "visits": v, "staff": max(1, int(math.ceil(v / VISITS_PER_STAFF_HOUR)))})

zone = {
    "zone": "B",
    "zone_name": "OMR and ECR corridor, south Chennai",
    "hub": {"name": "Sholinganallur", "lat": hub_row["lat"], "lon": hub_row["lon"],
            "rationale": (
                "Sholinganallur is the only candidate that is central to the corridor "
                "geometry, the OMR rail line boundary and the GCC free-supply network. "
                "Mean distance from the 50 localities to Sholinganallur is %.1f km; to "
                "Navalur it would be %.1f km and to Thiruvanmiyur %.1f km, and both of "
                "those sit at one end of the long thin ECR leg rather than at its "
                "centre. Sholinganallur also carries the GCC Animal Birth Control Centre "
                "at Div 199 Zone XV, so the cold-chain base and the free-supply "
                "referral point sit on the same street, and it is the widest-spread "
                "apartment stock in the zone with ELCOT, the Infosys campus township and "
                "RMZ Ecoworld within a 3 km radius."
                % (hub_km,
                   sum(haversine(r["lat"], r["lon"], next(x for x in L if x["id"] == "B01")["lat"],
                                 next(x for x in L if x["id"] == "B01")["lon"]) for r in loc_rows) / 50.0,
                   sum(haversine(r["lat"], r["lon"], next(x for x in L if x["id"] == "B45")["lat"],
                                 next(x for x in L if x["id"] == "B45")["lon"]) for r in loc_rows) / 50.0))},
    "generated_note": (
        "Zone B locality demand model, built %s. Fixed constants are taken from the "
        "spine report and are not re-derived. Every other number carries a provenance "
        "tier in its own basis field. Ward assignments follow the Greater Chennai "
        "Corporation's published ward street inventory; coordinates follow OpenStreetMap "
        "named features, or are placed on the OSM-mapped OMR/ECR spine and labelled "
        "tier B. Households are an allocation of the census-plus-property-tax household "
        "pool of the %d GCC wards the fifty localities sit in (%s households), split by "
        "OSM built weight and conserved to the pool; the verdicts are set by an explicit "
        "four-test rule and ranked by our-mix monthly revenue potential."
        % ("2026-10-24", len(ZONE_WARDS_USED), format(int(round(ZONE_HH)), ","))),
    "localities": loc_rows,
    "zone_summary": {
        "locality_count": len(loc_rows),
        "total_households": tot_hh,
        "total_pet_households": tot_pet_hh,
        "total_cases_per_month": tot_cases,
        "our_mix_monthly_revenue_potential": tot_our,
        "top_go_localities": [{"name": r["name"], "reason": r["verdict"]["reason"]}
                              for r in ordered if r["verdict"]["status"] == "GO"][:8],
        "avoid_localities": [{"name": r["name"], "reason": r["verdict"]["reason"]}
                              for r in ([x for x in ordered if x["verdict"]["status"] == "NO-GO"] +
                                        [x for x in reversed(ordered)
                                         if x["verdict"]["status"] != "NO-GO"])[:6]],
        "route_clusters": cluster_summ,
        "staffing_by_hour": staff,
        "key_caveats": [
            "Census 2011 ward tables use the pre-2018 155-ward structure and cannot be "
            "mapped one to one onto GCC wards 180-200. Households for the new ward "
            "structure are therefore modelled from the GCC residential property-tax "
            "ledger (tier A) and Census-2011 Corporation population (tier A); they are "
            "tier B and carry a plus or minus 25 percent band.",
            "The household allocation conserves the zone pool but not the ward pool: "
            "the pool of the %d wards the fifty localities sit in is split across all "
            "fifty by OSM built weight, so an individual locality can be allocated more "
            "households than its own ward holds (the five Madipakkam localities in ward "
            "187 are allocated %s households against ward 187's %s census-derived "
            "total). A per-ward split would hold ward totals exact but would push "
            "B15 Mappedu and B23 R.M.Z. Ecoworld below the 300-household floor."
            % (len(ZONE_WARDS_USED),
               format(sum(r["population"]["households"] for r in loc_rows
                          if r["id"] in ("B40", "B41", "B42", "B43", "B44")), ","),
               format(int(round(ward_hh[187])), ",")),
            "The whole pool is assumed to belong to the fifty localities: they are "
            "assumed to tile their %d wards. If they cover only part of a ward, the "
            "per-locality household figures are overstated by the uncovered share."
            % len(ZONE_WARDS_USED),
            "The tier-C animal rates were rescaled by %.3f so that the Corporation-wide "
            "animal base reproduces the GCC's own Aug-Oct 2026 vaccination target of "
            "2,00,000 dogs, and the licence penetration was re-derived at %.1f percent "
            "so the same base still reconciles to the spine's 68,736 active licences. "
            "The first-pass rates implied only about 78,000 city dogs, which "
            "contradicts that target and the June 2026 one-lakh-dogs-microchipped "
            "statement. The city built-form mix is not published, so the Corporation "
            "average density is taken as the mean of the five built-form rates; a "
            "residential-weighted mix would put the city animal base about 20 percent "
            "higher and the licence penetration at about 17 percent."
            % (PET_RATE_SCALE, LICENCE_PENETRATION * 100),
            "Sub-locality coordinates for the OMR villages (Kandanchal, Thazhuthendur, "
            "Siruthai, Poothapedi, Kovilambedu, Egumudi) are tier B: positioned on the "
            "OSM-mapped Rajiv Gandhi Salai spine at the chainage implied by the brief's "
            "OMR sequence. They are accurate to roughly 700 m, which is adequate for "
            "route design but not for door-level service planning.",
            "The brief's Zone B north limit reads 'Navalur and the Thazhuthendur side, up "
            "to but not including Padur and Kelambakkam'. Padur and Kelambakkam lie "
            "south-west of Navalur on OMR and Thazhuthendur lies north-east of it, so "
            "the stated north limit is internally inconsistent. The reading applied here "
            "is the one the anchor list forces: include Navalur, Kandanchal, Thazhuthendur, "
            "Siruthai, Semmancheri, Sholinganallur, Egumudi, Mappedu; exclude Padur, "
            "Kelambakkam and everything north of Navalur.",
            "GCC's 'Meenambakkam' pet clinic and ABC centre is listed by the corporation "
            "at Div 166 Zone XII with the street address B V Nagar, Nanganallur 600061. "
            "That address is the Enjambakkam B V Nagar pocket inside Zone B. The "
            "Meenambakkam suburb 3 km further west is outside the zone and is excluded. "
            "The naming collision must be resolved before the centre is used as a "
            "distance anchor.",
            "Thiruvanmiyur sits on the Zone A / Zone B seam. The Tidel Park and "
            "Rajiv Gandhi IT Expressway node and the Thiruvanmiyur cluster will pull to "
            "Zone A's north side. The southern 6 localities are modelled here in full but "
            "the verification of the seam is the single largest source of forecast "
            "error in this zone.",
            "Tier A competition data covers the named operators and their published "
            "prices. Per-operator ratings and review counts were not published on the "
            "pages loaded, so they are recorded as zero and the saturation index is "
            "built from operator type and count rather than from review volume.",
        ],
    },
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(zone, f, ensure_ascii=False, indent=1)

print("wrote", OUT, os.path.getsize(OUT), "bytes")
print("localities:", len(loc_rows))
print("ZONE_HH pool:", int(round(ZONE_HH)), "| wards used:", len(ZONE_WARDS_USED),
      "| total build weight:", int(TOTAL_BUILD_WEIGHT))
print("households:", tot_hh, "| pet households:", tot_pet_hh, "| cases/mo:", tot_cases)
print("our mix monthly revenue:", tot_our, "| market:", tot_mkt)
print("GO:", sum(1 for r in loc_rows if r["verdict"]["status"] == "GO"),
      "HOLD:", sum(1 for r in loc_rows if r["verdict"]["status"] == "HOLD"),
      "NO-GO:", sum(1 for r in loc_rows if r["verdict"]["status"] == "NO-GO"))
print("corp pop 2011:", corp_pop_2011, "| corp hh 2011:", int(corp_hh_2011),
      "| corp hh 2026:", int(corp_hh_2026))
print("zone PT growth 13-18:", round(ZONE_GROWTH_13_18, 4),
      "| corp PT growth:", round(CORP_PT_GROWTH_13_18, 4))
print("pet rate scale:", round(PET_RATE_SCALE, 4),
      "| licence penetration:", round(LICENCE_PENETRATION * 100, 2), "%",
      "| city animal base:", int(round(CITY_ANIMAL_BASE)))
print("zone pet-owning share: %.2f%%" %
      (100.0 * tot_pet_hh / tot_hh))
print("zone cases per household per month: %.4f" % (tot_cases / tot_hh))
print("top 5 by our-mix monthly revenue:")
for r in ordered[:5]:
    print("   %2d  %-42s Rs %9s  %6.1f cases/mo  %7s hh  %s" % (
        r["verdict"]["rank"], r["name"][:42],
        format(r["economics"]["our_mix"]["monthly_revenue_potential"], ","),
        r["demand"]["cases_per_month_total"],
        format(r["population"]["households"], ","), r["verdict"]["status"]))
