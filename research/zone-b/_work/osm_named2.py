import json, os, sys, io, time, urllib.parse, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
EP = "https://overpass-api.de/api/interpreter"
UA = "zone-b-vet-research/1.0 (internal R&D locality study)"
BBOX = "12.72,80.00,13.08,80.36"

PAT = ("Thazhuthendur|Tazhuthendur|Kandanchal|Siruthai|Egumudi|Sungudi|Kovilambedu|"
       "Koyilambedu|Poothapedi|Puthapedi|Enjambakkam|Udhagam|Chokkanathar|Kalavathi|"
       "Kadalambedu|Petty|Navalur|Akkarai|Siruvallur|Koyambedu|Puducherry|Poonamallee")

Q = f"""[out:json][timeout:300];
(
  nwr["name"~"({PAT})",i]({BBOX});
);
out center tags;"""

path = os.path.join(W, "osm_named2.json")
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
            time.sleep(10)

seen = set()
print("\n=== BROAD NAME MATCHES ===")
for e in d.get("elements", []):
    t = e.get("tags", {})
    if e["type"] == "node":
        lon, lat = e.get("lon"), e.get("lat")
    else:
        c = e.get("center") or {}
        lon, lat = c.get("lon"), c.get("lat")
    if lon is None:
        continue
    k = (t.get("name", ""), round(lat, 5), round(lon, 5), e["type"])
    if k in seen:
        continue
    seen.add(k)
    kind = t.get("place") or t.get("highway") or t.get("amenity") or t.get("landuse") \
        or t.get("addr:street") or t.get("railway") or t.get("shop") or t.get("leisure") or ""
    print("  %-46s %-16s %9.5f %9.5f %s" % (k[0][:46], kind[:16], k[2], k[1], e["type"]))

# --- vet / clinic list ---
d2 = json.load(open(os.path.join(W, "osm_vet.json"), encoding="utf-8"))
print("\n=== VET / CLINIC / HOSPITAL / MARKETPLACE / STATION ===")
rows = []
for e in d2.get("elements", []):
    t = e.get("tags", {})
    if e["type"] == "node":
        lon, lat = e.get("lon"), e.get("lat")
    else:
        c = e.get("center") or {}
        lon, lat = c.get("lon"), c.get("lat")
    if lon is None:
        continue
    kind = t.get("amenity") or t.get("shop") or t.get("healthcare") or t.get("railway") or ""
    if kind not in ("veterinary", "clinic", "hospital", "marketplace", "pet", "station"):
        continue
    rows.append((round(lat, 5), round(lon, 5), t.get("name", "(unnamed)"), kind,
                 t.get("phone", "") or t.get("contact:phone", ""),
                 t.get("website", "") or t.get("contact:website", "")))
seen2 = set()
for r in sorted(rows):
    k = (r[0], r[1], r[2])
    if k in seen2:
        continue
    seen2.add(k)
    print("  %-42s %-13s %-14s %8.5f %8.5f" % (r[2][:42], r[3][:13], r[4][:14], r[0], r[1]))
