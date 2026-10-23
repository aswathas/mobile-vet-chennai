import csv, json, collections, os, urllib.request
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
ws = collections.defaultdict(list)
with open(os.path.join(W,"gcc_streets.csv"), encoding="utf-8", errors="replace") as f:
    for row in csv.DictReader(f):
        wd=(row.get("Ward") or "").strip(); st=(row.get("Street Name") or "").strip()
        if wd and st: ws[wd].append(st)
for wd in range(168,201):
    s = ws.get(str(wd),[])
    # dedupe preserve order
    seen=set(); out=[]
    for x in s:
        if x not in seen: seen.add(x); out.append(x)
    print(f"--- WARD {wd}  (n={len(out)}) ---")
    print(" | ".join(out[:70]))
    if len(out)>70: print("   ...+",len(out)-70,"more")
