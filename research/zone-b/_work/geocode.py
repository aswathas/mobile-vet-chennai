import json, os, time, urllib.parse, urllib.request

W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
OUT = os.path.join(W, "geocode.json")
UA = "zone-b-vet-research/1.0 (internal R&D locality study)"

QUERIES = [
    "Navalur, Chennai, Tamil Nadu, India",
    "Navalur MGR Nagar, Chennai, Tamil Nadu, India",
    "Navalur Anna Nagar, Chennai, Tamil Nadu, India",
    "Akkarai, Chennai, Tamil Nadu, India",
    "Thazhuthendur, Chennai, Tamil Nadu, India",
    "Semmancheri, Chennai, Tamil Nadu, India",
    "Kandanchal, Chennai, Tamil Nadu, India",
    "Siruthai, Chennai, Tamil Nadu, India",
    "Poothapedi, Chennai, Tamil Nadu, India",
    "Kovilambedu, Chennai, Tamil Nadu, India",
    "Mappedu, Chennai, Tamil Nadu, India",
    "Egumudi, Chennai, Tamil Nadu, India",
    "Sholinganallur, Chennai, Tamil Nadu, India",
    "Kadumbadi, Chennai, Tamil Nadu, India",
    "Uthandi, Chennai, Tamil Nadu, India",
    "Palavakkam, Chennai, Tamil Nadu, India",
    "Enjambakkam, Chennai, Tamil Nadu, India",
    "Sungudi, Chennai, Tamil Nadu, India",
    "Perungudi, Chennai, Tamil Nadu, India",
    "Madipakkam, Chennai, Tamil Nadu, India",
    "Thiruvanmiyur, Chennai, Tamil Nadu, India",
    "T. Nagar, Thiruvanmiyur, Chennai, Tamil Nadu, India",
    "Ramapuram, Chennai, Tamil Nadu, India",
    "DLF IT Park, Chennai, Tamil Nadu, India",
    "Tidel Park, Chennai, Tamil Nadu, India",
    "ELCOT, Sholinganallur, Chennai, Tamil Nadu, India",
    "RMZ Ecoworld, Chennai, Tamil Nadu, India",
    "Thandalam, Chennai, Tamil Nadu, India",
    "Ascendas Tech Park, Chennai, Tamil Nadu, India",
    "Chokkanathar, Chennai, Tamil Nadu, India",
    "Bharathi Nagar, Sholinganallur, Chennai, Tamil Nadu, India",
    "Kalavathi, Chennai, Tamil Nadu, India",
    "Kaveri Nagar, Uthandi, Chennai, Tamil Nadu, India",
    "Sunnivasalpatti, Chennai, Tamil Nadu, India",
    "Manoraj, Chennai, Tamil Nadu, India",
    "Vandalur, Chennai, Tamil Nadu, India",
    "Otteri, Chennai, Tamil Nadu, India",
    "Kollathur, Chennai, Tamil Nadu, India",
    "Agaram, Chennai, Tamil Nadu, India",
    "Kotturvakkam, Chennai, Tamil Nadu, India",
    "Thazhuthendur, Kanchipuram, Tamil Nadu, India",
    "Udhagam, Chennai, Tamil Nadu, India",
    "Annavi street Navalur Chennai Tamil Nadu India",
    "Meenambakkam, Chennai, Tamil Nadu, India",
    "Pazhassi Raja street Sholinganallur Chennai Tamil Nadu India",
]

existing = {}
if os.path.exists(OUT):
    existing = json.load(open(OUT, encoding="utf-8"))

results = {}
for q in QUERIES:
    if q in existing:
        results[q] = existing[q]
        continue
    url = ("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&countrycodes=in"
           "&addressdetails=1&q=" + urllib.parse.quote(q))
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        data = {"error": str(e)}
    results[q] = data
    best = None
    if isinstance(data, list) and data:
        best = "%s | %s | %s" % (data[0].get("lat"), data[0].get("lon"),
                                 data[0].get("display_name", "")[:110])
    print("%-52s -> %s" % (q[:52], best if best else json.dumps(data)[:110]))
    time.sleep(1.2)

json.dump(results, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("saved", OUT)
