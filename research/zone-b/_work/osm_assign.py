import json, os, time, urllib.parse, urllib.request, math

W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
EP = "https://overpass-api.de/api/interpreter"
UA = "zone-b-vet-research/1.0 (internal R&D locality study)"
BBOX = "12.74,80.05,13.06,80.36"


def run(q, name):
    path = os.path.join(W, name)
    if os.path.exists(path):
        print("cached", name)
        return json.load(open(path, encoding="utf-8"))
    for attempt in range(3):
        try:
            req = urllib.request.Request(EP, data=urllib.parse.urlencode({"data": q}).encode(),
                                         headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=300) as r:
                d = json.loads(r.read().decode("utf-8"))
            json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False)
            print("saved", name, len(d.get("elements", [])))
            return d
        except Exception as e:
            print("attempt", attempt, "failed:", e)
            time.sleep(8)
    return {"elements": []}


Q_WARD10 = f"""[out:json][timeout:300];
(
  relation["boundary"="administrative"]["admin_level"="10"]({BBOX});
);
out geom;"""

wards10 = run(Q_WARD10, "osm_wards10.json")


def ring_of(el):
    """Return list of (lon,lat) outer rings for a relation."""
    rings = []
    for m in el.get("members", []):
        if m.get("role") in ("outer", ""):
            g = m.get("geometry")
            if g:
                rings.append([(p["lon"], p["lat"]) for p in g])
    return rings


def point_in_ring(x, y, ring):
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def point_in_el(x, y, el):
    rings = ring_of(el)
    if not rings:
        return False
    if not any(point_in_ring(x, y, r) for r in rings):
        return False
    # subtract holes
    for m in el.get("members", []):
        if m.get("role") == "inner" and m.get("geometry"):
            r = [(p["lon"], p["lat"]) for p in m["geometry"]]
            if point_in_ring(x, y, r):
                return False
    return True


places = json.load(open(os.path.join(W, "osm_places.json"), encoding="utf-8"))
polys = []
for el in wards10.get("elements", []):
    nm = el.get("tags", {}).get("name", "")
    if ring_of(el):
        polys.append((nm, el))

print("ward polys:", len(polys))
for nm, el in polys[:40]:
    print("   ", nm)

rows = []
for el in places.get("elements", []):
    t = el.get("tags", {})
    name = t.get("name")
    if not name:
        continue
    if el["type"] == "node":
        lon, lat = el.get("lon"), el.get("lat")
    else:
        c = el.get("center") or {}
        lon, lat = c.get("lon"), c.get("lat")
    if lon is None or lat is None:
        continue
    if not (12.74 <= lat <= 13.06 and 80.05 <= lon <= 80.36):
        continue
    ward = None
    for nm, p in polys:
        if point_in_el(lon, lat, p):
            ward = nm
            break
    rows.append({
        "name": name,
        "place": t.get("place"),
        "lat": round(lat, 6),
        "lon": round(lon, 6),
        "ward": ward,
        "osm_id": "%s/%s" % (el["type"], el["id"]),
    })

rows.sort(key=lambda r: (r["ward"] or "zz", r["name"]))
json.dump(rows, open(os.path.join(W, "osm_place_wards.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("\nplaced %d of %d" % (len(rows), len(places.get("elements", []))))
cur = None
for r in rows:
    if r["ward"] != cur:
        cur = r["ward"]
        print("\n--- %s ---" % cur)
    print("   %-42s %-12s %.5f, %.5f" % (r["name"][:42], r["place"], r["lat"], r["lon"]))
