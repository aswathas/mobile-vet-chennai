# -*- coding: utf-8 -*-
"""Summary figures used for SOURCES.md / MODEL.md / ANALYSIS.md."""
import json, collections, os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
HERE = os.path.dirname(os.path.abspath(__file__))
ZONE = os.path.dirname(HERE)
zp = json.load(open(os.path.join(ZONE, "localities.json"), encoding="utf-8"))
rows = zp["localities"]
zs = zp["zone_summary"]
TOT_HH = sum(r["population"]["households"] for r in rows)
TOT_CASES = sum(r["demand"]["cases_per_month_total"] for r in rows)
TOT_PET = sum(r["pet_base"]["pet_households"] for r in rows)

print("== TYPE MIX ==")
agg = collections.defaultdict(lambda: [0, 0.0, 0, 0])
for r in rows:
    a = agg[r["locality_type"]]
    a[0] += r["population"]["households"]
    a[1] += r["demand"]["cases_per_month_total"]
    a[2] += r["pet_base"]["pet_households"]
    a[3] += 1
for t, a in sorted(agg.items(), key=lambda x: -x[1][0]):
    print("  %-18s n=%2d hh %7s (%4.1f%%) cases %8.1f (%4.1f%%) pet hh %6s (%.1f%% of hh) "
          "%.2f animals/100hh %.2f cases/hh/mo" % (
              t, a[3], format(a[0], ","), 100 * a[0] / TOT_HH, a[1], 100 * a[1] / TOT_CASES,
              format(a[2], ","), 100 * a[2] / a[0], a[2] / a[0] * 1.35, a[1] / a[0]))
print("  TOTAL hh %s cases %.1f pet hh %s" % (format(TOT_HH, ","), TOT_CASES, format(TOT_PET, ",")))

print()
print("== HOUR CURVE (zone demand share) ==")
for h in ["%02d" % i for i in range(24)]:
    v = sum(r["hour_curve"][h] * r["demand"]["cases_per_month_total"] for r in rows)
    print("   %s %6.2f%%" % (h, 100 * v / TOT_CASES), end="")
    if int(h) % 4 == 3:
        print()
print()

print("== WEEKDAY (zone demand share) ==")
for d in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]:
    v = sum(r["weekday"][d] * r["demand"]["cases_per_month_total"] for r in rows)
    print("   %s %6.2f%%" % (d, 100 * v / TOT_CASES))
print("   weekend uplift (zone): %.1f%%" % (
    (sum(r["weekday"]["Sat"] + r["weekday"]["Sun"] for r in rows) / 2) /
    (sum(sum(r["weekday"][d] for d in ("Mon", "Tue", "Wed", "Thu", "Fri")) for r in rows) / 5) - 1))

print()
print("== SEASONALITY (locality index, unweighted mean) ==")
MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
for m in MON:
    vals = [r["seasonality"]["index"][m] for r in rows]
    print("   %s mean %6.1f  min %6.1f  max %6.1f" % (m, sum(vals) / len(vals), min(vals), max(vals)))

print()
print("== COMPETITION ==")
cnt = collections.Counter()
for r in rows:
    for c in r["competition"]["named"]:
        cnt[c["name"]] += 1
for k, v in cnt.most_common():
    print("   %-62s %d localities" % (k[:62], v))
print("   competitor count per locality: min %d max %d" % (
    min(r["competition"]["competitor_count"] for r in rows),
    max(r["competition"]["competitor_count"] for r in rows)))
print("   saturation: min %d max %d" % (
    min(r["competition"]["saturation_index"] for r in rows),
    max(r["competition"]["saturation_index"] for r in rows)))

print()
print("== PRICES ==")
print("   market mix avg visit price: %d to %d" % (
    min(r["price"]["market_mix"]["avg_visit_price"] for r in rows),
    max(r["price"]["market_mix"]["avg_visit_price"] for r in rows)))
print("   our mix blended price: %d to %d (margin %d to %d)" % (
    min(r["price"]["our_mix"]["blended_price"] for r in rows),
    max(r["price"]["our_mix"]["blended_price"] for r in rows),
    min(r["price"]["our_mix"]["blended_price"] - 850 for r in rows),
    max(r["price"]["our_mix"]["blended_price"] - 850 for r in rows)))
print("   our mix monthly revenue potential: %s" % format(zs["our_mix_monthly_revenue_potential"], ","))
print("   market mix monthly revenue potential: %s" % format(
    sum(r["economics"]["market_mix"]["monthly_revenue_potential"] for r in rows), ","))

print()
print("== SERVICEABLE CEILING (one route = 144 cases/mo, two = 288) ==")
one = [r for r in rows if r["demand"]["cases_per_month_total"] >= 144]
two = [r for r in rows if r["demand"]["cases_per_month_total"] >= 288]
print("   localities that can fill one route (>=144 cases/mo): %d of 50" % len(one))
print("   localities that can fill two routes (>=288 cases/mo): %d of 50" % len(two))
print("   demand absorbed by one route across the zone: %d cases/mo of %.0f (%.1f%%)" % (
    144 * len(one), TOT_CASES, 100 * 144 * len(one) / TOT_CASES))
print("   one-route contribution (best): Rs %s" % format(max(
    r["economics"]["serviceable_ceiling"]["one_route"]["contribution"] for r in rows), ","))
print("   two-route contribution (best): Rs %s" % format(max(
    r["economics"]["serviceable_ceiling"]["two_route"]["contribution"] for r in rows), ","))

print()
print("== TRAVEL ==")
print("   km to hub: min %.1f max %.1f mean %.1f" % (
    min(r["travel_km_to_hub"] for r in rows), max(r["travel_km_to_hub"] for r in rows),
    sum(r["travel_km_to_hub"] for r in rows) / 50))
print("   min to hub: min %d max %d" % (
    min(r["travel_min_to_hub"] for r in rows), max(r["travel_min_to_hub"] for r in rows)))
print("   services per trip possible:", sorted({r["travel"]["services_per_trip_possible"] for r in rows}))

print()
print("== VERDICTS ==")
for st in ("GO", "HOLD", "NO-GO"):
    sub = [r for r in rows if r["verdict"]["status"] == st]
    print("   %-6s %2d  revenue Rs %s  cases %s" % (
        st, len(sub),
        format(sum(r["economics"]["our_mix"]["monthly_revenue_potential"] for r in sub), ","),
        format(round(sum(r["demand"]["cases_per_month_total"] for r in sub), 1), ",")))
print("   confidence:", dict(collections.Counter(r["verdict"]["confidence"] for r in rows)))
for r in sorted(rows, key=lambda x: x["verdict"]["rank"]):
    if r["verdict"]["status"] != "GO" or r["verdict"]["rank"] in (1, 2, 3, 4, 5):
        print("   rank %2d %-42s %-5s sat %2d cases %7.1f hh %6s" % (
            r["verdict"]["rank"], r["name"][:42], r["verdict"]["status"],
            r["competition"]["saturation_index"], r["demand"]["cases_per_month_total"],
            format(r["population"]["households"], ",")))
print()
print("== TOP 10 BY OUR-MIX REVENUE ==")
for r in sorted(rows, key=lambda x: x["verdict"]["rank"])[:10]:
    print("   %2d %-42s Rs %9s  cases %7.1f  hh %6s  price %5s  margin %5s  sat %2d  %s" % (
        r["verdict"]["rank"], r["name"][:42],
        format(r["economics"]["our_mix"]["monthly_revenue_potential"], ","),
        r["demand"]["cases_per_month_total"], format(r["population"]["households"], ","),
        format(r["price"]["our_mix"]["blended_price"], ","),
        format(r["price"]["our_mix"]["blended_price"] - 850, ","),
        r["competition"]["saturation_index"], r["verdict"]["status"]))
print()
print("== BOTTOM 6 BY OUR-MIX REVENUE ==")
for r in sorted(rows, key=lambda x: x["verdict"]["rank"])[-6:]:
    print("   %2d %-42s Rs %9s  cases %7.1f  hh %6s  sat %2d  %s" % (
        r["verdict"]["rank"], r["name"][:42],
        format(r["economics"]["our_mix"]["monthly_revenue_potential"], ","),
        r["demand"]["cases_per_month_total"], format(r["population"]["households"], ","),
        r["competition"]["saturation_index"], r["verdict"]["status"]))
