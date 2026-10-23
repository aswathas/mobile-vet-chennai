import json, os, sys, io, math, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"

wards = json.load(open(os.path.join(W, "osm_wards10.json"), encoding="utf-8"))
roads = json.load(open(os.path.join(W, "osm_roads.json"), encoding="utf-8"))
places = json.load(open(os.path.join(W, "osm_place_wards.json"), encoding="utf-8"))


def rings(el):
    out = []
    for m in el.get("members", []):
        if m.get("role") in ("outer", "") and m.get("geometry"):
            out.append([(p["lon"], p["lat"]) for p in m["geometry"]])
    return out


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

pts = []
for e in roads.get("elements", []):
    t = e.get("tags", {})
    c = e.get("center") or {}
    if "lon" not in c:
        continue
    nm = t.get("name", "")
    if not nm:
        continue
    pts.append((c["lon"], c["lat"], nm))
for p in places:
    pts.append((p["lon"], p["lat"], p["name"]))


def locate(lon, lat):
    for nm, rs in polys:
        if any(pir(lon, lat, r) for r in rs):
            return nm
    return None


buckets = collections.defaultdict(list)
for lon, lat, nm in pts:
    w = locate(lon, lat)
    if w:
        buckets[w].append((lat, lon, nm))

print("%-10s %5s  %9s %9s   sample names" % ("WARD", "n", "cent_lat", "cent_lon"))
ward_geo = {}
for nm in sorted(buckets, key=lambda s: int("".join(c for c in s if c.isdigit()) or 0)):
    b = buckets[nm]
    la = sum(x[0] for x in b) / len(b)
    lo = sum(x[1] for x in b) / len(b)
    ward_geo[nm] = (round(la, 5), round(lo, 5), len(b))
    print("%-10s %5d  %9.5f %9.5f   %s" % (nm, len(b), la, lo,
          ", ".join(sorted(set(x[2] for x in b))[:4])[:70]))

json.dump(ward_geo, open(os.path.join(W, "ward_geo.json"), "w", encoding="utf-8"), indent=1)
