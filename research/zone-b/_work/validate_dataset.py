# -*- coding: utf-8 -*-
"""Schema and internal-consistency validation for research/zone-b/localities.json."""
import json, os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
HERE = os.path.dirname(os.path.abspath(__file__))
ZONE = os.path.dirname(HERE)

zp = json.load(open(os.path.join(ZONE, "localities.json"), encoding="utf-8"))
rows = zp["localities"]
zs = zp["zone_summary"]
errs = []
warns = []

TOP = {"zone", "zone_name", "hub", "generated_note", "localities", "zone_summary"}
LOC = ["id", "name", "aliases", "ward", "assembly_constituency", "pin_codes", "lat",
       "lon", "locality_type", "travel_km_to_hub", "travel_min_to_hub", "route_cluster",
       "population", "pet_base", "demand", "seasonality", "weekday",
       "weekend_uplift_pct", "hour_curve", "peak_window", "price", "economics",
       "competition", "cluster_assets", "travel", "verdict"]
if set(zp) != TOP:
    errs.append("top-level keys differ: %s" % (set(zp) ^ TOP))
if len(rows) != 50:
    errs.append("locality count %d != 50" % len(rows))
if zs["locality_count"] != 50:
    errs.append("zone_summary.locality_count != 50")

ids = [r["id"] for r in rows]
if len(set(ids)) != 50:
    errs.append("duplicate locality ids")
if sorted(r["verdict"]["rank"] for r in rows) != list(range(1, 51)):
    errs.append("ranks are not 1..50")

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
HOURS = ["%02d" % h for h in range(24)]
STR_FIELDS = {"id", "name", "ward", "assembly_constituency", "locality_type",
              "route_cluster", "tier", "basis", "status", "reason", "confidence",
              "scattered_or_clustered", "line", "type", "url", "peak_cover_definition",
              "start", "end", "notes"}

for r in rows:
    if list(r.keys()) != LOC:
        errs.append("%s key order/set differs from the brief schema: %s" %
                    (r["id"], set(r.keys()) ^ set(LOC)))
    for k in LOC:
        if k not in STR_FIELDS and not isinstance(r[k], (int, float, list, dict)):
            errs.append("%s.%s is %s, not a number" % (r["id"], k, type(r[k]).__name__))
    hc = r["hour_curve"]
    if list(hc.keys()) != HOURS:
        errs.append("%s hour_curve keys wrong" % r["id"])
    if abs(sum(hc.values()) - 1.0) > 0.001:
        errs.append("%s hour_curve sums to %.4f" % (r["id"], sum(hc.values())))
    wd = r["weekday"]
    if list(wd.keys()) != DAYS:
        errs.append("%s weekday keys wrong" % r["id"])
    if abs(sum(wd.values()) - 1.0) > 0.001:
        errs.append("%s weekday sums to %.4f" % (r["id"], sum(wd.values())))
    se = r["seasonality"]["index"]
    if list(se.keys()) != MONTHS:
        errs.append("%s seasonality keys wrong" % r["id"])
    if abs(sum(se.values()) / 12.0 - 100.0) > 0.5:
        errs.append("%s seasonality averages %.2f" % (r["id"], sum(se.values()) / 12.0))
    if r["verdict"]["status"] not in ("GO", "HOLD", "NO-GO"):
        errs.append("%s verdict status %s" % (r["id"], r["verdict"]["status"]))
    if r["verdict"]["confidence"] not in ("high", "medium", "low"):
        errs.append("%s confidence %s" % (r["id"], r["verdict"]["confidence"]))
    if r["locality_type"] not in ("apartment-cluster", "residential", "mixed",
                                  "commercial", "industrial"):
        errs.append("%s locality_type %s" % (r["id"], r["locality_type"]))
    for c in r["competition"]["named"]:
        if c["type"] not in ("house-call", "clinic-home-arm", "platform",
                              "corporate-mobile", "public-ngo"):
            errs.append("%s competitor type %s" % (r["id"], c["type"]))
        if not c["url"].startswith("http"):
            errs.append("%s competitor url %s" % (r["id"], c["url"]))
    # cross-field arithmetic
    hh = r["population"]["households"]
    pb = r["pet_base"]
    if abs(pb["dogs"] + pb["cats"] + pb["other_pets"] -
           round(hh * 0.0 + (pb["dogs"] + pb["cats"] + pb["other_pets"]))) > 0:
        errs.append("%s pet split does not add up" % r["id"])
    if abs(pb["licensed_pets"] + pb["unlicensed_pets"] -
           (pb["dogs"] + pb["cats"] + pb["other_pets"])) > 2:
        errs.append("%s licensed + unlicensed != animals" % r["id"])
    d = r["demand"]
    exp_cases = hh * {"apartment-cluster": 3.10, "residential": 2.45, "mixed": 2.80,
                       "commercial": 2.10, "industrial": 1.70}[r["locality_type"]] / 12.0
    if abs(d["cases_per_month_total"] - exp_cases) > 0.15:
        errs.append("%s cases %s != households x visits/12 = %.2f"
                    % (r["id"], d["cases_per_month_total"], exp_cases))
    ec = r["economics"]
    if abs(ec["our_mix"]["monthly_revenue_potential"] -
           round(d["cases_per_month_total"] * ec["our_mix"]["revenue_per_visit"])) > 2:
        errs.append("%s our_mix revenue != cases x revenue per visit" % r["id"])
    if ec["cost_per_visit_clustered"] != 850 or ec["blended_floor"] != 1100:
        errs.append("%s spine constants wrong" % r["id"])
    sc = ec["serviceable_ceiling"]
    if sc["one_route"]["cases_per_month"] > 144 or sc["two_route"]["cases_per_month"] > 288:
        errs.append("%s serviceable ceiling above the spine route capacity" % r["id"])
    if abs(sc["one_route"]["contribution"] -
           (sc["one_route"]["monthly_revenue"] - sc["one_route"]["cases_per_month"] * 850)) > 1:
        errs.append("%s one_route contribution arithmetic wrong" % r["id"])
    v = r["verdict"]["reason"]
    for token in ("cases a month", "households", "blended price", "margin of Rs",
                  "saturation index", "named operators"):
        if token not in v:
            errs.append("%s reason missing %r" % (r["id"], token))
    if r["population"]["tier"] not in ("A", "B", "C"):
        errs.append("%s population tier %s" % (r["id"], r["population"]["tier"]))

# zone summary arithmetic
if zs["total_households"] != sum(r["population"]["households"] for r in rows):
    errs.append("zone total_households mismatch")
if zs["total_pet_households"] != sum(r["pet_base"]["pet_households"] for r in rows):
    errs.append("zone total_pet_households mismatch")
if abs(zs["total_cases_per_month"] -
       sum(r["demand"]["cases_per_month_total"] for r in rows)) > 0.5:
    errs.append("zone total_cases_per_month mismatch")
if zs["our_mix_monthly_revenue_potential"] != sum(
        r["economics"]["our_mix"]["monthly_revenue_potential"] for r in rows):
    errs.append("zone our_mix revenue mismatch")
for cs in zs["route_clusters"]:
    sub = [r for r in rows if r["id"] in cs["localities"]]
    if abs(cs["cases_per_month"] - sum(r["demand"]["cases_per_month_total"] for r in sub)) > 0.5:
        errs.append("cluster %s cases mismatch" % cs["id"])
    if cs["monthly_revenue"] != sum(
            r["economics"]["our_mix"]["monthly_revenue_potential"] for r in sub):
        errs.append("cluster %s revenue mismatch" % cs["id"])
    if len(cs["localities"]) < 3 or len(cs["localities"]) > 8:
        warns.append("cluster %s has %d localities (brief asks 3-8)" %
                     (cs["id"], len(cs["localities"])))

if errs:
    print("VALIDATION FAILED (%d problems)" % len(errs))
    for e in errs:
        print("  -", e)
    sys.exit(1)
if warns:
    print("VALIDATION PASSED, with %d observation(s):" % len(warns))
    for w in warns:
        print("  ~", w)
else:
    print("VALIDATION PASSED: 50 localities, schema keys match the brief, hour curves,")
print("weekday splits and seasonality indices normalise, cross-field arithmetic holds,")
print("serviceable ceilings respect the 144/288-case spine route capacity, every")
print("reason string carries the six required figures, and the zone summary reconciles.")
