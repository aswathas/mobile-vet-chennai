import json, os, sys, io, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"

wards = json.load(open(os.path.join(W, "osm_wards10.json"), encoding="utf-8"))
roads = json.load(open(os.path.join(W, "osm_roads.json"), encoding="utf-8"))


def rings(el):
    return [[(p["lon"], p["lat"]) for p in m["geometry"]]
            for m in el.get("members", []) if m.get("role") in ("outer", "") and m.get("geometry")]


def pir(x, y, ring):
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


polys = []
for el in wards.get("elements", []):
    nm = el.get("tags", {}).get("name", "")
    rs = rings(el)
    if rs:
        polys.append((nm, rs))

TARGET = {"Ward 192", "Ward 193", "Ward194", "Ward 195", "Ward 196", "Ward 197",
          "Ward 198", "Ward 199", "Ward 200", "Ward 185", "Ward 186", "Ward 187"}

buckets = collections.defaultdict(list)
for e in roads.get("elements", []):
    t = e.get("tags", {})
    c = e.get("center") or {}
    nm = t.get("name")
    if "lon" not in c or not nm:
        continue
    lon, lat = c["lon"], c["lat"]
    for wnm, rs in polys:
        if wnm in TARGET and any(pir(lon, lat, r) for r in rs):
            buckets[wnm].append((nm, lat, lon))
            break

for w in sorted(TARGET, key=lambda s: int("".join(c for c in s if c.isdigit()) or 0)):
    b = buckets.get(w, [])
    if not b:
        print("=== %s : (no named OSM ways) ===" % w)
        continue
    la = sum(x[1] for x in b) / len(b)
    lo = sum(x[2] for x in b) / len(b)
    names = sorted(set(x[0] for x in b))
    print("=== %s  n=%d  centroid %.5f, %.5f ===" % (w, len(b), la, lo))
    print("    " + " | ".join(names[:28]))
