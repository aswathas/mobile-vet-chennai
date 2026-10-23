import json, os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"


def coord(e):
    if e["type"] == "node":
        return e.get("lon"), e.get("lat")
    c = e.get("center") or {}
    return c.get("lon"), c.get("lat")


d1 = json.load(open(os.path.join(W, "osm_named.json"), encoding="utf-8"))
print("=== NAMED MATCHES (%d) ===" % len(d1.get("elements", [])))
seen = set()
for e in d1.get("elements", []):
    t = e.get("tags", {})
    lon, lat = coord(e)
    if lon is None:
        continue
    k = (t.get("name", ""), round(lat, 5), round(lon, 5))
    if k in seen:
        continue
    seen.add(k)
    kind = t.get("place") or t.get("landuse") or t.get("highway") or t.get("amenity") or t.get("shop") or ""
    print("  %-44s %-16s %9.5f %9.5f" % (k[0][:44], kind[:16], k[2], k[1]))

d2 = json.load(open(os.path.join(W, "osm_vet.json"), encoding="utf-8"))
print("\n=== VET / CLINIC / STATION / MARKETPLACE (%d) ===" % len(d2.get("elements", [])))
seen2 = set()
rows = []
for e in d2.get("elements", []):
    t = e.get("tags", {})
    lon, lat = coord(e)
    if lon is None:
        continue
    kind = t.get("amenity") or t.get("shop") or t.get("healthcare") or t.get("railway") or ""
    if kind not in ("veterinary", "clinic", "hospital", "marketplace", "pet", "station"):
        continue
    k = (t.get("name", "(unnamed)"), kind, round(lat, 5), round(lon, 5))
    if k in seen2:
        continue
    seen2.add(k)
    rows.append((k[3], k[0], k[1], t.get("phone", "") or t.get("contact:phone", ""),
                 t.get("website", "") or t.get("contact:website", ""), k[2]))
for r in sorted(rows):
    print("  %-40s %-13s %-15s %8.5f %8.5f" % (r[1][:40], r[2][:13], r[3][:15], r[4], r[0]))
