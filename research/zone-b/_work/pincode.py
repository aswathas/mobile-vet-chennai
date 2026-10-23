import json, os, sys, io, time, urllib.parse, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) zone-b-vet-research/1.0"

CITIES = ["Navalur", "Akkarai", "Thazhuthendur", "Semmancheri", "Kandanchal", "Siruthai",
          "Poothapedi", "Kovilambedu", "Mappedu", "Egumudi", "Sholinganallur", "Kadumbadi",
          "Uthandi", "Palavakkam", "Enjambakkam", "Sungudi", "Perungudi", "Madipakkam",
          "Thiruvanmiyur", "Chokkanathar", "Kalavathi", "Udhagam", "Kotturvakkam",
          "Meenambakkam", "B V Nagar Chennai", "Kadumbadi Chennai", "Sanpinsi"]

out = {}
for c in CITIES:
    url = "https://api.postalpincode.in/postal/" + urllib.parse.quote(c)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            d = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        d = [{"error": str(e)}]
    out[c] = d
    print("%-22s" % c, json.dumps(d, ensure_ascii=False)[:340])
    time.sleep(0.7)

json.dump(out, open(os.path.join(W, "pincode.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("\nsaved pincode.json")
