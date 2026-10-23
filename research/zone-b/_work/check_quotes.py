# -*- coding: utf-8 -*-
"""Check the specific figures quoted in MODEL.md and ANALYSIS.md."""
import json, collections, os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
HERE = os.path.dirname(os.path.abspath(__file__))
ZONE = os.path.dirname(HERE)
zp = json.load(open(os.path.join(ZONE, "localities.json"), encoding="utf-8"))
rows = zp["localities"]

pt = json.load(open(os.path.join(HERE, "proptax.json"), encoding="utf-8"))
c18 = sum(float(r.get("2017-18 - Property Tax Collection (in crores) - Residential") or 0)
          for r in pt["result"]["records"])
c13 = sum(float(r.get("2013-14 - Property Tax Collection (in crores) - Residential") or 0)
          for r in pt["result"]["records"])
chh = 4621135 / 4.0 * (1 + (c18 / c13 - 1) * 0.85 + 0.145)
wpt = {int(r["Ward No."].strip().lstrip("N")):
       float(r.get("2017-18 - Property Tax Collection (in crores) - Residential") or 0)
       for r in pt["result"]["records"]}

by = collections.defaultdict(list)
for r in rows:
    by[int(r["ward"])].append(r)
print("WARD | allocated | ward_hh_2026 | n | localities")
for w in sorted(by):
    alloc = sum(r["population"]["households"] for r in by[w])
    print(" %3d | %8s | %8s | %2d | %s" % (
        w, format(alloc, ","), format(int(round(chh * wpt[w] / c18)), ","),
        len(by[w]), ",".join(r["id"] for r in by[w])))


def hh(ids):
    return sum(r["population"]["households"] for r in rows if r["id"] in ids)


print()
print("Palavakkam B25-B27 :", format(hh(["B25", "B26", "B27"]), ","))
print("Madipakkam B40-B44  :", format(hh(["B%02d" % i for i in range(40, 45)]), ","))
print("B-R4 B25-B34 (10)   :", format(hh(["B%02d" % i for i in range(25, 35)]), ","))
print("B-R6 B40-B44 (5)    :", format(hh(["B%02d" % i for i in range(40, 45)]), ","))
print("B-R7 B45-B50 (6)    :", format(hh(["B%02d" % i for i in range(45, 51)]), ","))
print("B-R1 B01-B08 (8)    :", format(hh(["B%02d" % i for i in range(1, 9)]), ","))
print("B-R2 B09-B16 (8)    :", format(hh(["B%02d" % i for i in range(9, 17)]), ","))
print("B-R3 B17-B24 (8)    :", format(hh(["B%02d" % i for i in range(17, 25)]), ","))
print("B-R5 B35-B39 (5)    :", format(hh(["B%02d" % i for i in range(35, 40)]), ","))

TOT = sum(r["demand"]["cases_per_month_total"] for r in rows)
h = lambda hh_key: sum(r["hour_curve"][hh_key] * r["demand"]["cases_per_month_total"] for r in rows) / TOT
print()
print("hour 10:00-16:59 share: %.1f%%" % (100 * sum(h(x) for x in ["10", "11", "12", "13", "14", "15", "16"])))
print("hour 07:00-19:59 share: %.1f%%" % (100 * sum(h("%02d" % i) for i in range(7, 20))))
print("hour 16:00-19:59 share: %.1f%%" % (100 * sum(h(x) for x in ["16", "17", "18", "19"])))
print("peak hour:", max(range(24), key=lambda i: h("%02d" % i)))
u = [r["weekend_uplift_pct"] for r in rows]
print("weekend uplift min %.1f max %.1f mean %.1f" % (min(u), max(u), sum(u) / len(u)))
sat = [(r["competition"]["saturation_index"], r["name"]) for r in rows]
print("lowest saturation:", sorted(sat)[:3])
print("highest saturation:", sorted(sat)[-6:])
print("cases min:", min((r["demand"]["cases_per_month_total"], r["name"]) for r in rows))
print("one-route fillable:", sum(1 for r in rows if r["demand"]["cases_per_month_total"] >= 144))
print("two-route fillable:", sum(1 for r in rows if r["demand"]["cases_per_month_total"] >= 288))
print("cases absorbed by one route per 50 localities: %d (%.1f%%)" % (144 * 50, 100 * 144 * 50 / TOT))
print("contribution one route max:", max(r["economics"]["serviceable_ceiling"]["one_route"]["contribution"] for r in rows))
print("contribution two route max:", max(r["economics"]["serviceable_ceiling"]["two_route"]["contribution"] for r in rows))
print("pets unlicensed zone:", sum(r["pet_base"]["unlicensed_pets"] for r in rows))
print("pets licensed zone:", sum(r["pet_base"]["licensed_pets"] for r in rows))
print("pets total zone:", sum(r["pet_base"]["dogs"] + r["pet_base"]["cats"] + r["pet_base"]["other_pets"] for r in rows))
print("zone animals:", round(sum(r["population"]["households"] * 0 + 0 for r in rows), 0))
print("staffing peak:", max(zp["zone_summary"]["staffing_by_hour"], key=lambda s: s["staff"]))
print("staffing 10:", zp["zone_summary"]["staffing_by_hour"][0])
print("mkt vs our revenue:", zp["zone_summary"]["our_mix_monthly_revenue_potential"],
      sum(r["economics"]["market_mix"]["monthly_revenue_potential"] for r in rows))
print("cases per pet-owning household per year: %.1f" % (
    sum(r["demand"]["cases_per_month_total"] for r in rows) * 12 / sum(r["pet_base"]["pet_households"] for r in rows)))
