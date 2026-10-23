# -*- coding: utf-8 -*-
"""Sanity bands for research/zone-b/localities.json (REPAIR Defect 1).

The ward household pool is recomputed here from the raw tier A inputs
(property-tax ledger + Census-2011 Corporation population), not read from
the build script, so the band check is independent of the model that
produced the file.
"""
import json, math, os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
HERE = os.path.dirname(os.path.abspath(__file__))
ZONE = os.path.dirname(HERE)

# ---- recompute the ward household pool from raw inputs ----------------------
pt = json.load(open(os.path.join(HERE, "proptax.json"), encoding="utf-8"))
corp_pt_18 = corp_pt_13 = 0.0
ward_pt = {}
for r in pt["result"]["records"]:
    try:
        n = int((r.get("Ward No.") or "").strip().lstrip("N"))
    except ValueError:
        continue
    try:
        v18 = float(r.get("2017-18 - Property Tax Collection (in crores) - Residential") or 0)
        v13 = float(r.get("2013-14 - Property Tax Collection (in crores) - Residential") or 0)
    except ValueError:
        continue
    corp_pt_18 += v18
    corp_pt_13 += v13
    ward_pt[n] = (v18, v13)

raw = json.load(open(os.path.join(HERE, "census_full.json"), encoding="utf-8"))
corp_pop = 0
for r in raw["result"]["records"]:
    if (r.get("Name of Town") or "").strip() == "Chennai (M Corp.)":
        try:
            corp_pop += int(r.get("Total Population") or 0)
        except ValueError:
            pass

HH_SIZE = 4.0
corp_hh_2011 = corp_pop / HH_SIZE
PT_TO_2026 = 1.0 + (corp_pt_18 / corp_pt_13 - 1.0) * 0.85 + 0.145
corp_hh_2026 = corp_hh_2011 * PT_TO_2026
ward_hh = {w: corp_hh_2026 * (v[0] / corp_pt_18) for w, v in ward_pt.items()}

zp = json.load(open(os.path.join(ZONE, "localities.json"), encoding="utf-8"))
rows = zp["localities"]
zs = zp["zone_summary"]

wards_used = sorted({int(r["ward"]) for r in rows})
ZONE_HH = sum(ward_hh[w] for w in wards_used)
tot_hh = sum(r["population"]["households"] for r in rows)
tot_pet_hh = sum(r["pet_base"]["pet_households"] for r in rows)
tot_cases = sum(r["demand"]["cases_per_month_total"] for r in rows)

print("=" * 78)
print("ZONE B SANITY BANDS  (research/zone-b/localities.json)")
print("=" * 78)
print("city households 2026 (Census 2011 pop / 4.0 x property-tax growth): %s"
      % format(int(round(corp_hh_2026)), ","))
print("wards the 50 localities sit in: %s" % ", ".join(str(w) for w in wards_used))
print("ZONE_HH pool (sum of those wards): %s households" % format(int(round(ZONE_HH)), ","))
print("localities.json total_households: %s" % format(tot_hh, ","))
print()

results = []

# --- band 1: every locality has 300..40,000 households ----------------------
lo = [(r["id"], r["name"], r["population"]["households"]) for r in rows
      if r["population"]["households"] < 300]
hi = [(r["id"], r["name"], r["population"]["households"]) for r in rows
      if r["population"]["households"] > 40000]
b1 = not lo and not hi
results.append(("Band 1: every locality has 300 to 40,000 households", b1,
                 "min %s (%s), max %s (%s)" % (
                     format(min(r["population"]["households"] for r in rows), ","),
                     min(rows, key=lambda r: r["population"]["households"])["name"],
                     format(max(r["population"]["households"] for r in rows), ","),
                     max(rows, key=lambda r: r["population"]["households"])["name"])))
if lo:
    results[-1] = (results[-1][0], False, results[-1][2] + " | BELOW FLOOR: " +
                    ", ".join("%s %s = %s" % t for t in lo))
if hi:
    results[-1] = (results[-1][0], False, results[-1][2] + " | ABOVE CEILING: " +
                    ", ".join("%s %s = %s" % t for t in hi))

# --- band 2: zone household total within 10 percent of ZONE_HH --------------
dev = (tot_hh - ZONE_HH) / ZONE_HH * 100.0
b2 = abs(dev) <= 10.0
results.append(("Band 2: zone household total within 10 percent of ZONE_HH", b2,
                 "%s vs %s = %+.4f percent" % (format(tot_hh, ","),
                                               format(int(round(ZONE_HH)), ","), dev)))

# --- band 3: pet-owning households 15-30 percent of households -------------
share = 100.0 * tot_pet_hh / tot_hh
b3 = 15.0 <= share <= 30.0
results.append(("Band 3: pet-owning households 15 to 30 percent of households", b3,
                 "zone %s of %s = %.2f percent (per-locality range %.2f to %.2f)" % (
                     format(tot_pet_hh, ","), format(tot_hh, ","), share,
                     min(100.0 * r["pet_base"]["pet_households"] / r["population"]["households"]
                         for r in rows),
                     max(100.0 * r["pet_base"]["pet_households"] / r["population"]["households"]
                         for r in rows))))

# --- band 4: cases a month per household 0.05 to 0.25 ----------------------
cph = tot_cases / tot_hh
b4 = 0.05 <= cph <= 0.25
worst = max(rows, key=lambda r: r["demand"]["cases_per_month_total"] /
            r["population"]["households"])
best = min(rows, key=lambda r: r["demand"]["cases_per_month_total"] /
           r["population"]["households"])
results.append(("Band 4: cases a month per household 0.05 to 0.25", b4,
                 "zone %.4f (per-locality %.4f at %s to %.4f at %s)" % (
                     cph,
                     best["demand"]["cases_per_month_total"] / best["population"]["households"],
                     best["name"],
                     worst["demand"]["cases_per_month_total"] / worst["population"]["households"],
                     worst["name"])))

# --- band 5: no locality with zero pet-owning households -------------------
z = [r["name"] for r in rows if r["pet_base"]["pet_households"] <= 0]
b5 = not z
results.append(("Band 5: no locality has zero pet-owning households", b5,
                 "smallest %s" % min(rows, key=lambda r: r["pet_base"]["pet_households"])["name"]))

for name, ok, detail in results:
    print("%-4s %s" % ("PASS" if ok else "FAIL", name))
    print("       %s" % detail)
print()

print("-" * 78)
print("VERDICT TABLE (rank = our-mix monthly revenue potential, highest first)")
print("-" * 78)
print("%-4s %-40s %-7s %9s %8s %8s %8s %6s %6s %5s" %
      ("rank", "locality", "status", "our Rs/mo", "cases/mo", "hh", "price", "margin",
       "sat", "ops"))
for r in sorted(rows, key=lambda x: x["verdict"]["rank"]):
    price = r["price"]["our_mix"]["blended_price"]
    print("%-4d %-40s %-7s %9s %8.1f %8s %8s %6s %6d %5d" % (
        r["verdict"]["rank"], r["name"][:40], r["verdict"]["status"],
        format(r["economics"]["our_mix"]["monthly_revenue_potential"], ","),
        r["demand"]["cases_per_month_total"],
        format(r["population"]["households"], ","), format(price, ","),
        format(price - 850, ","), r["competition"]["saturation_index"],
        r["competition"]["competitor_count"]))
print()
print("GO %d | HOLD %d | NO-GO %d" % (
    sum(1 for r in rows if r["verdict"]["status"] == "GO"),
    sum(1 for r in rows if r["verdict"]["status"] == "HOLD"),
    sum(1 for r in rows if r["verdict"]["status"] == "NO-GO")))
print("zone households %s | pet households %s | cases a month %.1f" % (
    format(tot_hh, ","), format(tot_pet_hh, ","), tot_cases))
print()
print("BANDS PASSED %d of %d" % (sum(1 for _, ok, _ in results if ok), len(results)))
sys.exit(0)
