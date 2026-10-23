import json, os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
rows = json.load(open(os.path.join(W, "osm_place_wards.json"), encoding="utf-8"))

KEYS = [
    "navalur", "akkarai", "thazhuthendur", "semmancheri", "kandanchal", "siruthai",
    "poothapedi", "kovilambedu", "koyilambedu", "mappedu", "egumudi", "sholinganallur",
    "kadumbadi", "uthandi", "palavakkam", "paavakkam", "enjambakkam", "sungudi",
    "perungudi", "madipakkam", "thiruvanmiyur", "kailasanathar", "petmai", "pettai",
    "ramapuram", "dlf", "tidel", "elcot", "rmz", "thandalam", "ascendas", "chokkanathar",
    "kalavathi", "kollathur", "kotturvakkam", "meenambakkam", "manoraj", "vandalur",
    "koyambedu", "peyari", "peyariya", "udhagam", "udagam", "siruvallur", "kelambakkam",
    "injambakkam", "neelankarai", "padur", "velachery", "pallikaranai", "chromepet",
    "medavakkam", "tambaram", "nanganallur", "kovalam", "kanathur", "kandanchal",
    "pazhuthendur", "madipakkam", "perungalathur", "koyambedu", "muttam", "saligramam",
    "vadapalani", "ashok nagar", "t nagar", "kandanchal", "mettu kuppam", "kamarajar",
    "govindarajapuram", "jaffna", "bheeman", "sri nagar", "lakshmi nagar", "sapthagiri",
    "tata", "tata motors", "prem", "sriram", "sri rama", "bhagavathi", "bhagavathy",
    "lakshmi", "annai indira", "indira nagar", "dlf it park", "sholinganallur coop",
    "navalur toll", "a2a", "toll", "podur", "silapakkam", "vandalur", "kothur",
    "mangadu", "mannivakkam", "mannivakkam", "otteri", "madipakkam", "karthikeyapuram",
    "kailasanathar", "thiruvanmiyur", "sembakkam", "senbagam", "pazhamudircholai",
    "sanp也好", "mambakkam", "vijayalaxmi", "mangambakkam",
]

hits = []
for r in rows:
    n = r["name"].lower()
    for k in KEYS:
        if k in n:
            hits.append((k, r))
            break

seen = set()
for k, r in sorted(hits, key=lambda x: x[1]["name"]):
    key = (r["name"], r["lat"], r["lon"])
    if key in seen:
        continue
    seen.add(key)
    print("%-40s | %-13s | %-11s | %9.5f %9.5f" % (
        r["name"][:40], r["place"], (r["ward"] or "-")[:11], r["lat"], r["lon"]))

print("\n=== ALL rows in zone-ish wards (183-200) ===")
for r in sorted(rows, key=lambda x: (x["ward"] or "zz", x["name"])):
    if r["ward"] and r["ward"].replace("Ward", "").strip().isdigit():
        n = int(r["ward"].replace("Ward", "").strip())
        if 183 <= n <= 200:
            print("%-6s %-38s %-13s %9.5f %9.5f" % (r["ward"], r["name"][:38], r["place"], r["lat"], r["lon"]))
