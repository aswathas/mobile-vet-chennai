import json, os, time, urllib.parse, urllib.request

W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
OUT = os.path.join(W, "osm_raw.json")
EP = "https://overpass-api.de/api/interpreter"
UA = "zone-b-vet-research/1.0 (internal R&D locality study)"

# Zone B bounding box: generous, covers Navalur (N) to Thiruvanmiyur (S), OMR (W) to ECR (E)
BBOX = "12.74,80.05,13.06,80.36"

Q_PLACE = f"""[out:json][timeout:180];
(
  node["place"~"^(suburb|neighbourhood|town|village|quarter|locality|city)$"]({BBOX});
  way["place"~"^(suburb|neighbourhood|town|village|quarter)$"]({BBOX});
  relation["place"~"^(suburb|neighbourhood|town|village|quarter)$"]({BBOX});
);
out tags center 4000;"""

Q_WARD = f"""[out:json][timeout:180];
(
  relation["boundary"="administrative"]["admin_level"="9"]({BBOX});
  relation["boundary"="administrative"]["admin_level"="8"]({BBOX});
);
out geom;"""


def run(q, name):
    path = os.path.join(W, name)
    if os.path.exists(path):
        print("cached", name)
        return json.load(open(path, encoding="utf-8"))
    req = urllib.request.Request(EP, data=urllib.parse.urlencode({"data": q}).encode(),
                                 headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=240) as r:
        d = json.loads(r.read().decode("utf-8"))
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False)
    print("saved", name, len(d.get("elements", [])))
    return d


places = run(Q_PLACE, "osm_places.json")
wards = run(Q_WARD, "osm_wards.json")

print("\n--- ward relations found ---")
for e in wards.get("elements", []):
    t = e.get("tags", {})
    nm = t.get("name", "")
    if "Zone" in nm or "Ward" in nm:
        print(" ", e["id"], "|", nm, "| lvl", t.get("admin_level"))
