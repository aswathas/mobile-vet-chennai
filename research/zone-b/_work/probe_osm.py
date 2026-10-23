# -*- coding: utf-8 -*-
"""Probe 2: OSM feature counts at several radii; first-pass JSON state."""
import collections, json, math, os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from zone_b_master import L

roads = json.load(open(os.path.join(HERE, "osm_roads.json"), encoding="utf-8"))
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


def count(lat, lon, r_km, kinds):
    n = 0
    names = []
    for olon, olat, nm, bld, lu, hw in osm_pts:
        if haversine(lat, lon, olat, olon) > r_km:
            continue
        if kinds == "apartments" and bld == "apartments":
            n += 1
        elif kinds == "gated" and lu == "residential":
            n += 1
        if nm:
            names.append(nm)
    return n


print("%-4s %-34s %6s %6s %6s %6s %6s %6s" %
      ("id", "name", "apt2.0", "res2.5", "apt3.0", "res3.5", "apt4.0", "res5.0"))
for loc in L:
    print("%-4s %-34s %6d %6d %6d %6d %6d %6d" % (
        loc["id"], loc["name"][:34],
        count(loc["lat"], loc["lon"], 2.0, "apartments"),
        count(loc["lat"], loc["lon"], 2.5, "gated"),
        count(loc["lat"], loc["lon"], 3.0, "apartments"),
        count(loc["lat"], loc["lon"], 3.5, "gated"),
        count(loc["lat"], loc["lon"], 4.0, "apartments"),
        count(loc["lat"], loc["lon"], 5.0, "gated")))

print()
print("--- OSM elements near B23 RMZ Ecoworld (13.00153,80.11820) within 6 km ---")
n = 0
for olon, olat, nm, bld, lu, hw in osm_pts:
    d = haversine(13.00153, 80.11820, olat, olon)
    if d <= 6.0:
        n += 1
        if n <= 25:
            print("  %5.2f km  bld=%-12s lu=%-14s name=%s" % (d, bld or "-", lu or "-", nm[:40]))
print("  total features within 6 km:", n)

print()
print("--- first-pass localities.json state ---")
zp = json.load(open(os.path.join(os.path.dirname(HERE), "localities.json"), encoding="utf-8"))
rows = zp["localities"]
zs = zp["zone_summary"]
print("localities:", len(rows))
print("zone_summary.total_households:", zs["total_households"])
print("zone_summary.total_pet_households:", zs["total_pet_households"])
print("zone_summary.total_cases_per_month:", zs["total_cases_per_month"])
zero_hh = [r["id"] for r in rows if r["population"]["households"] == 0]
zero_pet = [r["id"] for r in rows if r["pet_base"]["pet_households"] == 0]
print("zero households:", len(zero_hh), zero_hh)
print("zero pet households:", len(zero_pet), zero_pet)
print("verdicts:", collections.Counter(r["verdict"]["status"] for r in rows))
print("rank1:", [r["name"] for r in rows if r["verdict"]["rank"] == 1],
      "cases:", [r["demand"]["cases_per_month_total"] for r in rows if r["verdict"]["rank"] == 1])
print("hh range:", min(r["population"]["households"] for r in rows),
      max(r["population"]["households"] for r in rows))
print("cases range:", min(r["demand"]["cases_per_month_total"] for r in rows),
      max(r["demand"]["cases_per_month_total"] for r in rows))
print("sat range:", min(r["competition"]["saturation_index"] for r in rows),
      max(r["competition"]["saturation_index"] for r in rows))
print("blended price range:", min(r["price"]["our_mix"]["blended_price"] for r in rows),
      max(r["price"]["our_mix"]["blended_price"] for r in rows))
