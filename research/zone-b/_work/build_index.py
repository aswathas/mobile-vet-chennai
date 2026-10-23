import csv, json, collections, sys, urllib.request, os
W = r"C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b\_work"
ws = collections.defaultdict(list)
with open(os.path.join(W,"gcc_streets.csv"), encoding="utf-8", errors="replace") as f:
    r = csv.DictReader(f)
    for row in r:
        wd = (row.get("Ward") or "").strip()
        st = (row.get("Street Name") or "").strip()
        if wd and st:
            ws[wd].append(st)
print("wards with streets:", len(ws))
keys = ["NAVALUR","NAVALOOR","SIRUTHAI","SHOLINGANALLUR","SHOZHANGANALLUR","EGUMUDI","MAPEDU","PALAVAKKAM","THIRUVANMIYUR","SUNGUDI","THAZHUTHENDUR","KANDANCHAL","SEMMANCHERRY","KARAPAKKAM","MADIPAKKAM","PERUNGUDI","UTTANDI","UTHANDI","MELKALVOY","THURAIPAKKAM","AMBATTUR","ELLORA","MULCHOWK","ARUMUGAM","ELCOT","THIRU VI KA","VETTAYAR","KOVILAMPAKKAM","KOVILAMBEDU","PERUMALAI","POOMANAM","KOTTUWAR","SIRUVALLUR","PUGALUR","ARIGNAR ANNA","SATHIYAM","GOMATHI","RANA","SUVARNA","ANUGRAHA","ANUGRAHA CHETTI","SENTHIL","SANTHOSH","SUNRISE","OCEAN","INDIAN","TIDAL","MARINA","NANDANAM","PALLAVANTHANGAL","NEELANKARAI","INJAMBAKKAM","KOTRA","KOLLATHUR","KOVILAMBEDU","EASWAR NAGAR","VASUDEEVAPURAM","DHARMAPURI","SANTHANAM","KRISHNANAGAR","RAJA","ANNAMALAI","SESHACHALAM","AYYAPPAN","MAHALAKSHMI","MALLIGAI","VIJAYALAKSHMI","SARADHA","PONNI","KARUNAGAR","THENDRUM","SELAIYUR","THAMMIZH","NALLATHAMBAI"]
index = {}
for k in keys:
    hits = []
    for wd, streets in ws.items():
        for st in streets:
            if k in st.upper():
                hits.append((wd, st))
    if hits:
        index[k] = hits
json.dump(index, open(os.path.join(W,"ward_locality_hits.json"),"w"), ensure_ascii=False, indent=1)
for k,v in index.items():
    wards = sorted(set(w for w,_ in v))
    print(k, "->", wards, "n=",len(v))
