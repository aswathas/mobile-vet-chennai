import json, os, collections

W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
pt = json.load(open(os.path.join(W, "proptax.json"), encoding="utf-8"))
recs = pt["result"]["records"]
zones = collections.Counter((r.get("Zone Name") or "").strip() for r in recs)
print("ZONES:", json.dumps(zones, indent=1))
print()
for r in recs:
    z = (r.get("Zone Name") or "").strip()
    if z in ("Adyar", "Perungudi", "Sholinganallur", "Perungudi ", "Tondiarpet"):
        print(repr(r.get("Ward No.")), "|", repr(r.get("Ward Name")), "|", repr(z), "| res", r.get("2017-18 - Property Tax Collection (in crores) - Residential"))
