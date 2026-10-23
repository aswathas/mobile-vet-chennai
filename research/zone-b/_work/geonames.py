import json, os, sys, io, re, time, urllib.parse, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

NAMES = ["Thazhuthendur", "Tazhuthendur", "Kandanchal", "Siruthai", "Egumudi",
         "Enjambakkam", "Sungudi", "Kovilambedu", "Koyilambedu", "Poothapedi",
         "Chokkanathar", "Kalavathi", "Udhagam", "Semmancheri", "Akkarai",
         "Thiruvanmiyur", "Navalur", "Sholinganallur", "Palavakkam", "Uthandi"]

out = {}
for n in NAMES:
    url = ("https://www.geonames.org/search.html?q=" + urllib.parse.quote(n)
           + "&country=IN&adminCode1=25")
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            html = r.read().decode("utf-8", "replace")
    except Exception as e:
        html = ""
        print(n, "ERR", e)
    rows = re.findall(r'<tr class="tr">(.*?)</tr>', html, re.S)
    hits = []
    for rw in rows[:6]:
        tds = re.findall(r"<td[^>]*>(.*?)</td>", rw, re.S)
        if len(tds) < 4:
            continue
        geo = re.findall(r"([\d.]+)&#176;|([\d.]+)°|([\d.]+) N", tds[2] + tds[3])
        nums = re.findall(r"([\d]{1,3}\.\d+)", re.sub(r"<[^>]+>", " ", tds[2]) + " " +
                          re.sub(r"<[^>]+>", " ", tds[3]))
        nm = re.sub(r"<[^>]+>", " ", tds[1]).strip()
        hits.append({"name": nm, "coord_cell": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", tds[2])),
                     "admin": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", tds[3]))[:60],
                     "nums": nums})
    out[n] = hits
    print("%-16s %s" % (n, json.dumps(hits, ensure_ascii=False)[:400]))
    time.sleep(1.0)

json.dump(out, open(os.path.join(W, "geonames.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("\nsaved geonames.json")
