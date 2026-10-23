import json, os, sys, io, time, urllib.parse, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
UA = "zone-b-vet-research/1.0 (internal R&D locality study)"

g = json.load(open(os.path.join(W, "geocode.json"), encoding="utf-8"))
print("=== PASS 1 ===")
missing = []
for q, d in g.items():
    if isinstance(d, list) and d:
        b = d[0]
        print("%-50s %9.5f %9.5f | %s" % (q[:50], float(b["lat"]), float(b["lon"]),
                                          b.get("display_name", "")[:100]))
    else:
        missing.append(q)
print("\nMISSING:", len(missing))
for m in missing:
    print("  ", m)

VARIANTS = {
    "Thazhuthendur": ["Thazhuthendur, Kanchipuram, Tamil Nadu, India",
                      "Thazhuthendur, Thiruporur, Tamil Nadu, India",
                      "Tazhuthendur, Chennai, Tamil Nadu, India"],
    "Kandanchal": ["Kandanchal, Thiruporur, Tamil Nadu, India",
                    "Kandanchal, Chennai, Tamil Nadu, India"],
    "Egumudi": ["Egumudi, Thiruporur, Tamil Nadu, India",
                "Egumudi, Chennai, Tamil Nadu, India"],
    "Siruthai": ["Siruthai, Kanchipuram, Tamil Nadu, India",
                 "Siruthai, Chennai, Tamil Nadu, India"],
    "Poothapedi": ["Poothapedi, Chennai, Tamil Nadu, India"],
    "Kovilambedu": ["Koyilambedu, Chennai, Tamil Nadu, India",
                    "Kovilambedu, Chennai, Tamil Nadu, India"],
    "Sungudi": ["Sungudi, Chennai, Tamil Nadu, India",
                "Sungudi, Palavakkam, Chennai, Tamil Nadu, India"],
    "Enjambakkam": ["Enjambakkam, Chennai, Tamil Nadu, India"],
    "Chokkanathar": ["Chokkanathar, Chennai, Tamil Nadu, India"],
    "Kalavathi": ["Kalavathi, Madipakkam, Chennai, Tamil Nadu, India"],
    "Udhagam": ["Udhagam, Navalur, Chennai, Tamil Nadu, India"],
    "Kaveri Nagar": ["Kaveri Nagar, Chennai, Tamil Nadu, India"],
    "T N Nagar": ["T.N. Nagar, Thiruvanmiyur, Chennai, Tamil Nadu, India"],
    "DLF IT Park": ["DLF IT Park, Ramapuram, Chennai, Tamil Nadu, India",
                    "DLF IT Park Chennai, Old Mahabalipuram Road, Chennai"],
    "RMZ Ecoworld": ["RMZ Ecoworld, Thandalam, Chennai, Tamil Nadu, India"],
    "Ascendas": ["Ascendas Tech Park, Sholinganallur, Chennai, Tamil Nadu, India"],
}

out = {}
for q in missing:
    short = q.split(",")[0].strip()
    cands = VARIANTS.get(short, [])
    got = None
    for c in cands:
        url = ("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=2&countrycodes=in"
               "&addressdetails=1&q=" + urllib.parse.quote(c))
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.loads(r.read().decode("utf-8"))
        except Exception as e:
            d = {"error": str(e)}
        if isinstance(d, list) and d:
            got = d
            print("\n%s  <=  %s" % (q, c))
            for b in d:
                print("    %9.5f %9.5f | %s" % (float(b["lat"]), float(b["lon"]),
                                                b.get("display_name", "")[:120]))
            break
        time.sleep(1.1)
    if not got:
        print("\n%s  ==> NOT FOUND" % q)
    out[q] = got if got else (g.get(q) if isinstance(g.get(q), list) else [])
    time.sleep(1.1)

json.dump(out, open(os.path.join(W, "geocode2.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("\nsaved geocode2.json")
