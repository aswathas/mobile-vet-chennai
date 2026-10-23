import json, os, sys, io, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"

RES = {
    "housing": "7dee8eaa-e4d8-44af-a5de-4b8e96da0c95",
    "household_assets": "3c3d42b0-e549-42d1-847e-a6a1e24cf166",
    "census": "14e58af6-7ed9-4445-bb47-acc931364c12",
}
for k, rid in RES.items():
    try:
        url = ("https://data.opencity.in/api/3/action/datastore_search?resource_id=%s&limit=3" % rid)
        d = json.load(urllib.request.urlopen(url, timeout=60))
        print("=== %s  total=%d ===" % (k, d["result"]["total"]))
        print("FIELDS:", [f["id"] for f in d["result"]["fields"]])
        for r in d["result"]["records"][:2]:
            print("   ", json.dumps(r, ensure_ascii=False)[:400])
        json.dump(d, open(os.path.join(W, "probe_%s.json" % k), "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
    except Exception as e:
        print(k, "ERR", e)
    print()
