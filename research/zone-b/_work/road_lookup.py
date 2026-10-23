import json, os, sys, io, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"

d = json.load(open(os.path.join(W, "osm_roads.json"), encoding="utf-8"))
items = []
for e in d.get("elements", []):
    t = e.get("tags", {})
    c = e.get("center") or {}
    if "lon" not in c:
        continue
    items.append((t.get("name", ""), c.get("lat"), c.get("lon"),
                  t.get("highway") or t.get("landuse") or t.get("leisure")
                  or t.get("amenity") or t.get("building") or ""))

TOKENS = ["Thazhuthendur", "Tazhuthendur", "Thazhuth", "Kandanchal", "Siruthai",
          "Egumudi", "Enjambakkam", "Sungudi", "Kovilambedu", "Koyilambedu",
          "Poothapedi", "Puthapedi", "Chokkanathar", "Kalavathi", "Udhagam",
          "Semmancheri", "Akkarai", "Navalur", "Pettai", "Petmai", "Thandalam",
          "Kadumbadi", "Uthandi", "Palavakkam", "Paavakkam", "Madipakkam", "Perungudi",
          "Thiruvanmiyur", "Mambakkam", "Kollathur", "Manoraj", "Sunnivasalpatti",
          "Puducherry", "Koyambedu", "Anugraha", "Sanguthar", "VGP", "Kasthuribai",
          "Venkateswara", "Cholamandalam", "Gajira", "Kapaleeswaran", "Neelangarai",
          "Bhadri", "Rajarajeswari", "Sathya", "Ponni", "Bethel", "Shesathri",
          "Karthick", "Hanumar", "Teacher Colony", "Bharathi Nagar", "Nehru Nagar",
          "Chandrasekaran", "Santham", "Royale", "Egret", "Fords", "Iskan", "Allikulam",
          "Kudimiyandi", "Chidhambaram", "Yadhaval", "Velu Naicker", "Kadakuttai",
          "Kumar Nagar", "Ganesh Nagar", "Lakshmi Nagar", "Kasdthuribal", "Sowdeeswari",
          "Vivekanandar", "Vinayaga Avenue", "Pamban", "Iyyappa", "Annai Indiranagar",
          "Thiruvalluvar", "Rajiv Garden", "Aazhkandeswarar", "Alagappa", "Sree Nagar",
          "Balaji Nagar", "Devaraj", "Kokilambal", "Krishna Nagar", "Kumaraguru",
          "Kumaran Kudil", "Parthasarathy", "Ananda Nagar", "Balamurugan", "Customs Colony",
          "Ellaimman", "Rajiv Gandhi Road", "Industrial Estate", "TNHB", "Sriram Nagar",
          "Raghunatha", "MGR Salai", "Nadhi", "Rajan Nagar", "Selva Nagar", "Pallavan Nagar",
          "Devi Nagar", "Bismilla", "Cholan Nagar", "Poompuhar", "Aavin Sreet", "Gandhi Avenue"]

agg = collections.defaultdict(list)
for nm, lat, lon, kind in items:
    u = nm.upper()
    for t in TOKENS:
        if t.upper() in u:
            agg[t].append((nm, lat, lon, kind))
            break

for t in TOKENS:
    hits = agg.get(t, [])
    if not hits:
        print("%-20s -> NONE" % t)
        continue
    lat = sum(h[1] for h in hits) / len(hits)
    lon = sum(h[2] for h in hits) / len(hits)
    names = sorted(set(h[0] for h in hits))[:4]
    print("%-20s n=%-4d avg %9.5f %9.5f | %s" % (t, len(hits), lat, lon, " ; ".join(names)[:95]))
