import json, os, collections
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
pt = json.load(open(os.path.join(W,"proptax.json"),encoding="utf-8"))
recs = pt["result"]["records"]
print("records:", len(recs))
zones = collections.Counter(r["Zone Name"].strip() for r in recs)
print(list(zones.items())[:25])
sample = [r for r in recs if "Sholing" in r["Zone Name"].strip() or "Perungudi" in r["Zone Name"].strip() or "Adyar" in r["Zone Name"].strip()]
print("sample zones rows:", len(sample))
for r in sample[:6]:
    print(repr(r["Ward No.")), "|", repr(r["Ward Name"]), "|", repr(r["Zone Name"]))
