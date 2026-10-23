# -*- coding: utf-8 -*-
"""Probe: ward household totals, OSM weights, and the proposed allocation."""
import collections, csv, json, math, os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from zone_b_master import L, COST_CLUSTERED

W = HERE

# ---- property tax (as build_localities.py) ---------------------------------
pt = json.load(open(os.path.join(W, "proptax.json"), encoding="utf-8"))
ward_pt = {}
corp_pt_18 = corp_pt_13 = 0.0
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
    ward_pt[n] = {"pt18": v18, "pt13": v13}

# ---- census ---------------------------------------------------------------
raw = json.load(open(os.path.join(W, "census_full.json"), encoding="utf-8"))
corp_pop_2011 = 0
for r in raw["result"]["records"]:
    if (r.get("Name of Town") or "").strip() == "Chennai (M Corp.)":
        try:
            corp_pop_2011 += int(r.get("Total Population") or 0)
        except ValueError:
            pass

HH_SIZE = 4.0
CORP_PT_GROWTH = corp_pt_18 / corp_pt_13 if corp_pt_13 else 1.0
PT_TO_2026 = 1.0 + (CORP_PT_GROWTH - 1.0) * 0.85 + 0.145
corp_hh_2011 = corp_pop_2011 / HH_SIZE
corp_hh_2026 = corp_hh_2011 * PT_TO_2026
ward_hh = {}
for w in sorted(ward_pt):
    ward_hh[w] = corp_hh_2026 * (ward_pt[w]["pt18"] / corp_pt_18 if corp_pt_18 else 0)

print("corp_pop_2011      :", corp_pop_2011)
print("corp_pt_18 total   :", round(corp_pt_18, 3), "cr")
print("corp_pt_13 total   :", round(corp_pt_13, 3), "cr")
print("corp_hh_2011       :", int(corp_hh_2011))
print("corp_pt_18/13      :", round(CORP_PT_GROWTH, 5))
print("PT_TO_2026         :", round(PT_TO_2026, 5))
print("corp_hh_2026       :", int(corp_hh_2026))
print()
wards_used = sorted({int(x["ward"]) for x in L})
print("wards used by 50  :", wards_used, "n =", len(wards_used))
for w in wards_used:
    print("   ward %3d  hh=%9.0f  pt18=%.3f cr  streets_localities=%s"
          % (w, ward_hh[w], ward_pt[w]["pt18"],
             [x["id"] for x in L if int(x["ward"]) == w]))
ZONE_HH = sum(ward_hh[w] for w in wards_used)
print("ZONE_HH            :", round(ZONE_HH, 1))
print("wards NOT used     :", sorted(set(ward_hh) - set(wards_used)),
      "hh there:", round(sum(ward_hh[w] for w in set(ward_hh) - set(wards_used)), 1))
print()

# ---- OSM feature counts ----------------------------------------------------
roads = json.load(open(os.path.join(W, "osm_roads.json"), encoding="utf-8"))
osm_pts = []
for e in roads.get("elements", []):
    t = e.get("tags", {})
    c = e.get("center") or {}
    if "lon" not in c:
        continue
    osm_pts.append((c["lon"], c["lat"], t.get("name", ""),
                    t.get("building") or "", t.get("landuse") or "", t.get("highway") or ""))
print("osm_pts:", len(osm_pts))


def haversine(a1, a2, b1, b2):
    R = 6371.0
    p1, p2 = math.radians(a1), math.radians(b1)
    dp = math.radians(b1 - a1)
    dl = math.radians(b2 - a2)
    x = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(x))


def nearby(lat, lon, r_km, kinds):
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


rows = []
for loc in L:
    apt_n, apt_names = nearby(loc["lat"], loc["lon"], 2.0, "apartments")
    gate_n, gate_names = nearby(loc["lat"], loc["lon"], 2.5, "gated")
    w = apt_n + gate_n + 1
    rows.append((loc["id"], loc["name"], loc["ltype"], int(loc["ward"]), apt_n, gate_n, w,
                 loc["built"], loc["aff"]))

tot_w = sum(r[6] for r in rows)
print("total weight:", tot_w)
print()
print("%-4s %-34s %-16s %-5s %4s %4s %5s %6s %6s %8s %8s" %
      ("id", "name", "type", "ward", "apt", "gat", "wt", "built", "aff", "hh", "cases/mo"))
for (lid, name, lt, ward, apt_n, gate_n, w, built, aff) in rows:
    hh = ZONE_HH * w / tot_w
    rate = {"apartment-cluster": 3.10, "residential": 2.45, "mixed": 2.80,
            "commercial": 2.10, "industrial": 1.70}[lt]
    cases = hh * rate / 12.0
    print("%-4s %-34s %-16s %-5s %4d %4d %5d %6.2f %6.2f %8.0f %8.1f" %
          (lid, name[:34], lt, ward, apt_n, gate_n, w, built, aff, hh, cases))
print()
print("sum hh        :", round(sum(ZONE_HH * r[6] / tot_w for r in rows), 1))
print("min hh        :", round(min(ZONE_HH * r[6] / tot_w for r in rows), 1))
print("max hh        :", round(max(ZONE_HH * r[6] / tot_w for r in rows), 1))
