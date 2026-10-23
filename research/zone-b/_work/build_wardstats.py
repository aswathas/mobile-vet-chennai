import json, os, collections, urllib.request

W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"

# --- property tax: ward -> zone + tax collection -----------------------------
pt = json.load(open(os.path.join(W, "proptax.json"), encoding="utf-8"))
wardmeta = {}
for r in pt["result"]["records"]:
    code = (r.get("Ward No.") or "").strip().lstrip("N")
    try:
        n = int(code)
    except ValueError:
        continue
    if 150 <= n <= 200:
        res = []
        for y in ("2013-14", "2014-15", "2015-16", "2016-17", "2017-18"):
            res.append(float(r.get("%s - Property Tax Collection (in crores) - Residential" % y) or 0))
        com = []
        for y in ("2013-14", "2014-15", "2015-16", "2016-17", "2017-18"):
            com.append(float(r.get("%s - Property Tax Collection (in crores) - Commercial" % y) or 0))
        wardmeta[n] = {
            "zone": (r.get("Zone Name") or "").strip(),
            "res_pt_series": res,
            "com_pt_series": com,
            "res_pt_2017": res[-1],
            "com_pt_2017": com[-1],
            "res_pt_2013": res[0],
        }

# --- census 2011 ward population ---------------------------------------------
url = ("https://data.opencity.in/api/3/action/datastore_search?resource_id="
       "14e58af6-7ed9-4445-bb47-acc931364c12&limit=9000")
raw = json.load(urllib.request.urlopen(url))
pop = collections.Counter()
sc = collections.Counter()
ebs = collections.Counter()
for r in raw["result"]["records"]:
    wn = (r.get("Ward Number") or "").strip()
    try:
        n = int(wn)
    except ValueError:
        continue
    try:
        pop[n] += int(r.get("Total Population") or 0)
    except ValueError:
        pass
    try:
        sc[n] += int(r.get("SC Population") or 0)
    except ValueError:
        pass
    ebs[n] += 1

# --- housing/household 2011 --------------------------------------------------
try:
    url2 = ("https://data.opencity.in/api/3/action/datastore_search?resource_id="
            "7dee8eaa-e4d8-44af-a5de-4b8e96da0c95&limit=2000")
    raw2 = json.load(urllib.request.urlopen(url2))
    print("HOUSING fields:", json.dumps(raw2["result"]["fields"], indent=1))
    print("HOUSING sample:", json.dumps(raw2["result"]["records"][:3], indent=1))
except Exception as e:
    print("housing fetch failed:", e)

out = {}
for n in sorted(wardmeta):
    out[n] = dict(wardmeta[n],
                  census_pop_2011=pop.get(n, 0),
                  sc_pop_2011=sc.get(n, 0),
                  eb_blocks=ebs.get(n, 0))
json.dump(out, open(os.path.join(W, "ward_stats.json"), "w"), ensure_ascii=False, indent=1)

print()
print("%-5s %-18s %-7s %-9s %-8s %-9s %-9s" % ("ward", "zone", "pop11", "sc11", "resPT17", "comPT17", "resPT13"))
for n in sorted(out):
    v = out[n]
    print("%-5d %-18s %-7d %-9d %-8.3f %-9.3f %-9.3f" % (
        n, v["zone"], v["census_pop_2011"], v["sc_pop_2011"],
        v["res_pt_2017"], v["com_pt_2017"], v["res_pt_2013"]))
