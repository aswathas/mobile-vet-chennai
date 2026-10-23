import csv, collections, json, os, re, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"

# --- GCC street inventory (tier A: GCC published ward street list) -----------
ws = collections.defaultdict(list)
with open(os.path.join(W, "gcc_streets.csv"), encoding="utf-8", errors="replace") as f:
    for row in csv.DictReader(f):
        wd = (row.get("Ward") or "").strip()
        st = (row.get("Street Name") or "").strip()
        if wd and st:
            ws[wd].append(st)

ZONE_WARDS = [str(w) for w in list(range(183, 201)) + [166, 167, 168, 169, 170, 171, 172,
                                                          174, 175, 176, 177, 178, 179, 180, 181, 182]]

# extract candidate COLONY tokens from GCC street names of the zone wards
TOK = re.compile(r"\b([A-Z][A-Z\.]*(?:\s+[A-Z][A-Z\.]*){0,3})\s+(?:NAGAR|NAGAR\.|COLONY|LAYOUT|"
                 r"AVENUE|GARDEN|PARK|TOWN|COLONY|ESTATE)\b")
tok_ward = collections.defaultdict(set)
tok_count = collections.Counter()
for wd in ZONE_WARDS:
    for st in ws.get(wd, []):
        u = st.upper()
        for m in TOK.finditer(u):
            t = m.group(1).strip()
            if len(t) < 4 or t in ("ARIGNAR ANNA", "MAHATMA GANDHI", "ANNAI", "BHARATHIYAR",
                                   "RAJIV GANDHI", "ARUNACHALAM", "PILLAIYAR", "GANESH",
                                   "NEW", "SOUTH", "NORTH", "ANNA", "SRI", "SAI"):
                continue
            tok_ward[t].add(wd)
            tok_count[t] += 1

print("=== GCC-DERIVED COLONY TOKENS IN ZONE WARDS (count>=4) ===")
rows = []
for t, c in tok_count.most_common():
    if c >= 4:
        rows.append((c, t, sorted(tok_ward[t], key=int)))
for c, t, wds in rows:
    print("  %-34s n=%-4d wards %s" % (t[:34], c, ",".join(wds)))

json.dump({t: {"count": tok_count[t], "wards": sorted(tok_ward[t], key=int)}
           for t in tok_count if tok_count[t] >= 3},
          open(os.path.join(W, "gcc_colony_tokens.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("\ntotal tokens>=3:", sum(1 for t in tok_count if tok_count[t] >= 3))
