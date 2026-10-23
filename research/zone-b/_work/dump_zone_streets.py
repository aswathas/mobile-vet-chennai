import csv, collections, os

W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
ws = collections.defaultdict(list)
with open(os.path.join(W, "gcc_streets.csv"), encoding="utf-8", errors="replace") as f:
    for row in csv.DictReader(f):
        wd = (row.get("Ward") or "").strip()
        st = (row.get("Street Name") or "").strip()
        if wd and st:
            ws[wd].append(st)

out = []
for wd in range(150, 201):
    s = ws.get(str(wd), [])
    seen, uniq = set(), []
    for x in s:
        if x not in seen:
            seen.add(x)
            uniq.append(x)
    out.append("=== WARD %s (n=%d) ===" % (wd, len(uniq)))
    out.append(" | ".join(uniq))
    out.append("")

with open(os.path.join(W, "wards_150_200_streets.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(out))
print("written", sum(len(x) for x in out), "chars")
