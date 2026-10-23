import json, os, sys, io, time, urllib.parse, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
UA = "zone-b-vet-research/1.0 (internal R&D locality study)"

# viewbox = left,top,right,bottom ; bounded=1 restricts to it
TRIALS = [
    ("Thazhuthendur", "80.21,12.865,80.245,12.885"),
    ("Thazhuthendur", "80.21,12.86,80.25,12.90"),
    ("Kandanchal", "80.19,12.825,80.225,12.845"),
    ("Kandanchal", "80.18,12.80,80.24,12.86"),
    ("Siruthai", "80.185,12.805,80.215,12.835"),
    ("Siruthai", "80.18,12.78,80.23,12.85"),
    ("Egumudi", "80.165,12.795,80.205,12.825"),
    ("Egumudi", "80.16,12.78,80.22,12.84"),
    ("Enjambakkam", "80.22,12.915,80.255,12.945"),
    ("Enjambakkam", "80.20,12.90,80.27,12.96"),
    ("Sungudi", "80.21,12.935,80.255,12.965"),
    ("Sungudi", "80.20,12.92,80.27,12.98"),
    ("Kovilambedu", "80.16,12.82,80.20,12.86"),
    ("Poothapedi", "80.185,12.83,80.215,12.86"),
    ("Udhagam Navalur", "80.215,12.835,80.245,12.86"),
    ("Chokkanathar", "80.155,12.87,80.195,12.905"),
    ("Kalavathi Madipakkam", "80.185,12.95,80.215,12.975"),
    ("Navalur MGR Nagar", "80.215,12.835,80.245,12.86"),
    ("Sunnivasalpatti", "80.16,12.83,80.21,12.88"),
    ("Manoraj Sholinganallur", "80.215,12.88,80.25,12.91"),
    ("Kotturvakkam", "80.24,12.95,80.28,12.99"),
    ("Semmancheri", "80.205,12.865,80.235,12.895"),
    ("Thazuthendur", "80.21,12.855,80.25,12.895"),
]

out = {}
for name, vb in TRIALS:
    key = "%s|%s" % (name, vb)
    if key in out:
        continue
    url = ("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&countrycodes=in"
           "&viewbox=" + vb + "&bounded=1&q=" + urllib.parse.quote(name))
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            d = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        d = {"error": str(e)}
    out[key] = d
    if isinstance(d, list) and d:
        for b in d[:3]:
            print("%-26s vb=%-26s %9.5f %9.5f | %s" % (name, vb, float(b["lat"]), float(b["lon"]),
                                                       b.get("display_name", "")[:95]))
    else:
        print("%-26s vb=%-26s -> none" % (name, vb))
    time.sleep(1.15)

json.dump(out, open(os.path.join(W, "geocode3.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("\nsaved geocode3.json")
