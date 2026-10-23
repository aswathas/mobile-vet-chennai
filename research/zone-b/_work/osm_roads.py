import json, os, sys, io, time, urllib.parse, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
EP = "https://overpass-api.de/api/interpreter"
UA = "zone-b-vet-research/1.0 (internal R&D locality study)"
BBOX = "12.76,80.05,13.00,80.30"

Q = f"""[out:json][timeout:300];
(
  way["highway"]["name"]({BBOX});
  relation["highway"]["name"]({BBOX});
  way["landuse"~"residential|commercial|industrial|retail"]["name"]({BBOX});
  way["leisure"~"park|garden"]["name"]({BBOX});
  way["amenity"~"school|college|hospital|marketplace|place_of_worship"]["name"]({BBOX});
  way["building"="apartments"]["name"]({BBOX});
);
out center tags;"""

path = os.path.join(W, "osm_roads.json")
if os.path.exists(path):
    d = json.load(open(path, encoding="utf-8"))
else:
    for a in range(3):
        try:
            req = urllib.request.Request(EP, data=urllib.parse.urlencode({"data": Q}).encode(),
                                         headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=300) as r:
                d = json.loads(r.read().decode("utf-8"))
            json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False)
            print("saved", len(d.get("elements", [])))
            break
        except Exception as e:
            print("attempt", a, "err", e)
            time.sleep(12)

rows = []
for e in d.get("elements", []):
    t = e.get("tags", {})
    c = e.get("center") or {}
    if "lon" not in c:
        continue
    nm = t.get("name", "")
    kind = t.get("highway") or t.get("landuse") or t.get("leisure") or t.get("amenity") or t.get("building")
    rows.append((round(c["lat"], 5), round(c["lon"], 5), nm, kind))

seen = set()
for r in sorted(rows):
    k = (r[0], r[1], r[2])
    if k in seen:
        continue
    seen.add(k)
    print("  %-52s %-22s %8.5f %8.5f" % (r[2][:52], r[3][:22], r[0], r[1]))
print("total named ways:", len(seen))
