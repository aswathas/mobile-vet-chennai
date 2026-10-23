import json, os, sys, io, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"

roads = json.load(open(os.path.join(W, "osm_roads.json"), encoding="utf-8"))

# 1. corridor axis sampling: print named ways whose name marks the ECR / OMR spine
print("=== CORRIDOR SPINE (ECR / OMR) named ways, sorted by lat ===")
spine = []
for e in roads.get("elements", []):
    t = e.get("tags", {})
    nm = (t.get("name") or "").upper()
    c = e.get("center") or {}
    if "lon" not in c:
        continue
    if ("EAST COAST ROAD" in nm) or ("OLD MAHABALIPURAM ROAD" in nm) or \
       ("RAJIV GANDHI SALAI" in nm) or ("RAJIV GANDHI IT EXPRESSWAY" in nm) or \
       ("OMR" in nm and t.get("highway") in ("primary", "secondary")):
        spine.append((round(c["lat"], 4), round(c["lon"], 4), nm[:60], t.get("highway")))
for s in sorted(set(spine)):
    print("  %9.4f %9.4f  %-62s %s" % s)

print("\n=== named ways in the 12.80-12.94 lat band (OMR stretch), unique names ===")
band = collections.defaultdict(list)
for e in roads.get("elements", []):
    t = e.get("tags", {})
    c = e.get("center") or {}
    if "lon" not in c:
        continue
    if 12.80 <= c["lat"] <= 12.94 and t.get("name"):
        band[round(c["lat"], 4)].append((t["name"], t.get("highway") or ""))
for la in sorted(band):
    names = sorted(set(n for n, _ in band[la]))
    print("  lat %.4f  n=%-3d %s" % (la, len(band[la]), " ; ".join(names[:6])[:105]))
