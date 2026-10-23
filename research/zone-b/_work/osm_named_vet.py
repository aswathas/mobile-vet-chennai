import json, os, sys, io, time, urllib.parse, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
EP = "https://overpass-api.de/api/interpreter"
UA = "zone-b-vet-research/1.0 (internal R&D locality study)"
BBOX = "12.78,80.05,13.02,80.29"

NAMES = ("Navalur|Navaloor|Akkarai|Thazhuthendur|Tazhuthendur|Semmancheri|Kandanchal|"
         "Siruthai|Poothapedi|Puthapedi|Kovilambedu|Koyilambedu|Mappedu|Egumudi|"
         "Sholinganallur|Sozhanganallur|Kadumbadi|Uthandi|Palavakkam|Paavakkam|"
         "Enjambakkam|Sungudi|Perungudi|Madipakkam|Thiruvanmiyur|Kailasanathar|"
         "Petmai|Pettai|Ramapuram|Thandalam|Chokkanathar|Kalavathi|Kollathur|"
         "Udhagam|Sunnivasalpatti|Manoraj|Kotturvakkam|Vandalur|Vandalur|Sembakkam|"
         "Puducherry|Mambakkam|Mangadu|Meenambakkam|Nanganallur|Moovarasampettai|"
         "Egumudi|Kovilambedu|VGP|Santham|Chandrasekaran|Kasthuribai|Venkateswara|"
         "Anugraha|Cholamandalam|Gajira|Kapaleeswaran|Neelangarai|Neelankarai|"
         "Bhadri|Kootathil|Pachaiyappa|Rajarajeswari|Sathya|Ponni|Bethel|"
         "Vishwaroop|Pudhucherry|Vivekananda|Kasthuri|Kasthuri|Sangeetha|"
         "Solaiyur|Sodai|Sadhavaram|Madipakkam|Pudhucherry|Velamuthu|"
         "Pazhamudircholai|Balathur|Mambattu|Ponneri|Mangadu|Uthandi|Kaveri|"
         "Anakaputhur|Pammal|Mambakkam|Vandalur|Thakkolam|Kelambakkam")

Q1 = f"""[out:json][timeout:240];
(
  nwr["name"~"^({NAMES})$"]({BBOX});
);
out center tags;"""

Q2 = f"""[out:json][timeout:240];
(
  nwr["amenity"~"^(veterinary|clinic|hospital|marketplace)$"]({BBOX});
  nwr["shop"="pet"]({BBOX});
  nwr["healthcare"~"veterinary|doctor"]({BBOX});
  nwr["railway"="station"]({BBOX});
  nwr["amenity"="marketplace"]({BBOX});
);
out center tags;"""


def run(q, name):
    path = os.path.join(W, name)
    if os.path.exists(path):
        print("cached", name)
        return json.load(open(path, encoding="utf-8"))
    for a in range(3):
        try:
            req = urllib.request.Request(EP, data=urllib.parse.urlencode({"data": q}).encode(),
                                         headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=300) as r:
                d = json.loads(r.read().decode("utf-8"))
            json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False)
            print("saved", name, len(d.get("elements", [])))
            return d
        except Exception as e:
            print("attempt", a, "err", e)
            time.sleep(10)
    return {"elements": []}


def coord(e):
    if e["type"] == "node":
        return e.get("lon"), e.get("lat")
    c = e.get("center") or {}
    return c.get("lon"), c.get("lat")


d1 = run(Q1, "osm_named.json")
d2 = run(Q2, "osm_vet.json")

print("\n=== NAMED MATCHES ===")
rows = []
for e in d1.get("elements", []):
    t = e.get("tags", {})
    lon, lat = coord(e)
    if lon is None:
        continue
    rows.append((t.get("name", ""), t.get("place", "") or t.get("landuse", "") or t.get("highway", "")
                 or t.get("amenity", ""), round(lat, 6), round(lon, 6)))
for r in sorted(set(rows)):
    print("  %-42s %-14s %9.5f %9.5f" % (r[0][:42], r[1][:14], r[3], r[4]))

print("\n=== VET / MEDICAL / STATION / MARKETPLACE ===")
rows2 = []
for e in d2.get("elements", []):
    t = e.get("tags", {})
    lon, lat = coord(e)
    if lon is None:
        continue
    rows2.append((t.get("name", "(unnamed)"), t.get("amenity", "") or t.get("shop", "")
                  or t.get("healthcare", "") or t.get("railway", ""),
                  t.get("phone", "") or t.get("contact:phone", ""),
                  t.get("website", "") or t.get("contact:website", ""),
                  round(lat, 6), round(lon, 6)))
for r in sorted(set(rows2)):
    print("  %-38s %-14s %-14s %8.5f %8.5f" % (r[0][:38], r[1][:14], r[2][:14], r[4], r[5]))
