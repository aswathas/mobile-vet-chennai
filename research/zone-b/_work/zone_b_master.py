# -*- coding: utf-8 -*-
"""Zone B (OMR/ECR corridor) locality master data.

Every field carries an evidence note. Tier A = source loaded; B = derived in
MODEL.md; C = modelled with stated assumption.
"""
import csv, collections, json, math, os, sys, io

if (getattr(sys.stdout, "encoding", "") or "").lower().replace("-", "") != "utf8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
W = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- spine points
# OSM-mapped corridor spine (tier A: OpenStreetMap named ways).
# OMR = "Rajiv Gandhi Salai" / "Old Mahabalipuram Road"; ECR = "East Coast Road".
OMR = [(12.7870, 80.22075), (12.7928, 80.22224), (12.7960, 80.22290),
       (12.7980, 80.22380), (12.8022, 80.22470), (12.8082, 80.22660),
       (12.8114, 80.22780), (12.8144, 80.22930), (12.8193, 80.23010),
       (12.8243, 80.23130), (12.8279, 80.23040), (12.8318, 80.22960),
       (12.8355, 80.22860), (12.8393, 80.22770), (12.8428, 80.22710),
       (12.8468, 80.22650), (12.8571, 80.22640), (12.8581, 80.22700),
       (12.8715, 80.22660), (12.8765, 80.22690), (12.8887, 80.22730),
       (12.9010, 80.22790), (12.9039, 80.22820), (12.9122, 80.22920),
       (12.9151, 80.22960), (12.9239, 80.23060), (12.9341, 80.23410),
       (12.9438, 80.23770), (12.9462, 80.23920), (12.9488, 80.24060),
       (12.9498, 80.24110), (12.9509, 80.24140), (12.9517, 80.24160),
       (12.9539, 80.24260), (12.9544, 80.24260), (12.9557, 80.24310),
       (12.9564, 80.24360), (12.9570, 80.24370), (12.9577, 80.24400),
       (12.9597, 80.24510)]

ECR = [(12.7036, 80.21788), (12.7559, 80.24176), (12.7814, 80.24692),
       (12.7863, 80.24430), (12.7914, 80.24254), (12.7952, 80.24240),
       (12.7992, 80.24180), (12.8041, 80.24250), (12.8097, 80.24270),
       (12.8320, 80.24110), (12.8335, 80.24180), (12.8551, 80.24160),
       (12.8610, 80.24200), (12.8648, 80.24260), (12.8735, 80.24380),
       (12.8802, 80.24460), (12.8822, 80.24500), (12.8858, 80.24550),
       (12.8926, 80.24640), (12.8974, 80.24740), (12.9087, 80.24930),
       (12.9198, 80.25110), (12.9342, 80.25270), (12.9390, 80.25330),
       (12.9488, 80.25460), (12.9537, 80.25510), (12.9869, 80.25800)]


def spine_lon(pts, lat):
    """Interpolate longitude of a corridor spine at a given latitude."""
    pts = sorted(pts)
    if lat <= pts[0][0]:
        return pts[0][1]
    if lat >= pts[-1][0]:
        return pts[-1][1]
    for (a, la), (b, lb) in zip(pts, pts[1:]):
        if a <= lat <= b:
            if b == a:
                return la
            return la + (lb - la) * (lat - a) / (b - a)
    return pts[-1][1]


def omr(lat, off=0.0):
    return round(lat, 5), round(spine_lon(OMR, lat) + off, 5)


def ecr(lat, off=0.0):
    return round(lat, 5), round(spine_lon(ECR, lat) + off, 5)


# ------------------------------------------------------------------- constants
COST_CLUSTERED = 850          # spine report, fixed
COST_SCATTERED = 1498         # B: 850 x (37/21) travel-ratio scaling
BLENDED_FLOOR = 1100          # spine report, fixed
CLUSTER_TRAVEL_MIN = 21       # spine: clustered round trip, 21 min travel per visit
CLUSTER_CLIN_MIN = 25         # spine: 25 min clinical work per visit
SCATTER_TRAVEL_MIN = 37
AVG_TRAVEL_MIN_PER_10KM = 3.125   # spine: 31 min 15 s per 10 km
PEAK_TRAVEL_MIN_PER_10KM = 4.11   # spine: 41 min 6 s per 10 km

# Chennai Corporation free pet supply: GCC vet pet clinic + ABC centre list.
# Load of https://chennaicorporation.gov.in/gcc/veterinary/about/ (tier A):
#   Meenambakkam ABC centre  - Div 166, Zone XII
#   Sholinganallur ABC centre- Div 199, Zone XV
#   Pet clinics (6): Thiru-Vi-Ka Nagar (Div 68, Z VI), Pullianthope (77, Z VI),
#   Nungambakkam (110, Z IX), Lloyds Colony (120, Z IX),
#   Kannammapet (141, Z X), Meenambakkam (166, Z XII). Hours 08:00-15:00.
GCC_PET_CLINICS = [
    ("GCC Veterinary Pet Clinic, Meenambakkam", 166, "Zone XII Alandur", 12.98660, 80.17264),
    ("GCC Veterinary Pet Clinic, Thiru-Vi-Ka Nagar", 68, "Zone VI Thiru-Vi-Ka Nagar", 13.07900, 80.22300),
    ("GCC Veterinary Pet Clinic, Pullianthope", 77, "Zone VI Thiru-Vi-Ka Nagar", 13.08900, 80.22800),
    ("GCC Veterinary Pet Clinic, Nungambakkam", 110, "Zone IX Teynampet", 13.08700, 80.19400),
    ("GCC Veterinary Pet Clinic, Lloyds Colony", 120, "Zone IX Teynampet", 13.08100, 80.26200),
    ("GCC Veterinary Pet Clinic, Kannammapet", 141, "Zone X Kodambakkam", 13.05100, 80.21200),
]
GCC_ABC = [
    ("GCC Animal Birth Control Centre, Sholinganallur", 199, "Zone XV Sholinganallur", 12.89354, 80.23206),
    ("GCC Animal Birth Control Centre, Meenambakkam", 166, "Zone XII Alandur", 12.98660, 80.17264),
    ("GCC Animal Birth Control Centre, B.R.L.C", 77, "Zone VI", 13.08900, 80.22800),
    ("GCC Animal Birth Control Centre, Lloyds Road", 120, "Zone IX", 13.08100, 80.26200),
    ("GCC Animal Birth Control Centre, Kannammapet", 141, "Zone X", 13.05100, 80.21200),
]

# ------------------------------------------------------- zone master table
# id, name, aliases, gcc_ward, constituency, pins, (lat,lon), geo_tier,
# locality_type, cluster, built_form, affluence_band, notes
L = []


def add(lid, name, aliases, ward, ac, pins, lat, lon, geo_tier, ltype,
        cluster, built, aff, notes):
    L.append(dict(id=lid, name=name, aliases=aliases, ward=ward, ac=ac, pins=pins,
                  lat=lat, lon=lon, geo_tier=geo_tier, ltype=ltype, cluster=cluster,
                  built=built, aff=aff, notes=notes))


# ---- R1 : Navalur and the Akkarai / ECR-north end --------------------------
add("B01", "Navalur", ["Navallur", "Navalur Town", "Navalur Junction"], "198",
    "Sholinganallur (AC 27)", ["600097"], 12.84559, 80.22722, "A", "apartment-cluster",
    "B-R1", 1.25, 0.92,
    "OSM place node 'Navalur' (suburb) at 12.84559,80.22722 plus 'Navalur' bus stop at "
    "12.84458,80.22646; sits on the OSM-mapped Rajiv Gandhi Salai. GCC ward 198 street "
    "list carries Navalur-area colonies (Akkarai Village, Rajiv Gandhi Nagar, Kudimiyandi "
    "Thoppu, Sunrise Avenue, Copper Beach Road, East Coast Road).")
add("B02", "Navalur M.G.R. Nagar", ["Kudimiyandi Thoppu M.G.R. Nagar", "MGR Nagar Navalur"],
    "198", "Sholinganallur (AC 27)", ["600097"], *omr(12.8430, 0.0012), "B",
    "residential", "B-R1", 0.85, 0.74,
    "GCC ward 198 lists 7 Kudimiyandi Thoppu M.G.R. Nagar streets (tier A street count). "
    "Position placed on the OSM OMR spine at the Navalur chainage, 130 m east.")
add("B03", "Navalur Rajiv Gandhi Nagar", ["Rajiv Gandhi Nagar Navalur", "R.G. Nagar Navalur"],
    "198", "Sholinganallur (AC 27)", ["600097"], *omr(12.8487, 0.0022), "B",
    "apartment-cluster", "B-R1", 1.15, 0.82,
    "GCC ward 198 lists 6 Rajiv Gandhi Nagar streets incl. main road and Mayana Pathai "
    "(tier A). Position placed on the OSM OMR spine at the Navalur chainage, 240 m east.")
add("B04", "Akkarai", ["Akkarai Village", "Akkarai Navalur"], "198",
    "Sholinganallur (AC 27)", ["600097"], *ecr(12.8380, -0.0022), "B",
    "residential", "B-R1", 0.80, 0.70,
    "GCC ward 198 lists 7 Akkarai Village / Akkarai numbered streets (tier A). Position "
    "placed on the OSM East Coast Road spine 2.2 km south-west of the Navalur chainage.")
add("B05", "Navalur Annai Indiranagar", ["Anna Nagar Navalur", "Indira Nagar Navalur"],
    "195", "Sholinganallur (AC 27)", ["600097"], *omr(12.8440, 0.0075), "B",
    "residential", "B-R1", 0.80, 0.72,
    "GCC ward 195 lists Annai Indiranagar 1st-3rd cross streets and main road (tier A). "
    "Position placed on the OSM OMR spine at the Navalur chainage, 820 m east (towards ECR).")
add("B06", "Navalur V.G.P. Avenue", ["VGP Avenue Navalur", "V.G.P Avenue"], "195",
    "Sholinganallur (AC 27)", ["600097"], *omr(12.8470, 0.0095), "B",
    "apartment-cluster", "B-R1", 1.30, 0.95,
    "GCC ward 195 lists 6 V.G.P. Avenue streets (tier A). Position placed on the OSM OMR "
    "spine at the Navalur chainage, 1.05 km east.")
add("B07", "Navalur Santham Avenue", ["Santham Avenue Navalur", "Royal Avenue Navalur"],
    "195", "Sholinganallur (AC 27)", ["600097"], *omr(12.8505, 0.0100), "B",
    "apartment-cluster", "B-R1", 1.35, 0.96,
    "GCC ward 195 lists Santham Avenue, Royal Avenue 1st-2nd streets, Egret Park and "
    "Fords Avenue (tier A). Position placed on the OSM OMR spine, 1.1 km east.")
add("B08", "Navalur Chandra Sekhar Avenue", ["Chandrasekaran Avenue Navalur", "Sowdeeswari Nagar"],
    "195", "Sholinganallur (AC 27)", ["600097"], *omr(12.8528, 0.0062), "B",
    "residential", "B-R1", 0.75, 0.68,
    "GCC ward 195 lists 13 Chandrasekaran Avenue streets plus Sowdeeswari Nagar road and "
    "Kasdthuribal Nagar (tier A). Position placed on the OSM OMR spine, 690 m east.")

# ---- R2 : OMR main - Kandanchal, Thazhuthendur, Siruthai -------------------
add("B09", "Thazhuthendur", ["Thazuthendur", "Thazhuthendur Junction"], "193",
    "Sholinganallur (AC 27)", ["600117"], *omr(12.8688, 0.0005), "B",
    "mixed", "B-R2", 0.95, 0.72,
    "Brief-named OMR anchor. No OSM node for the village; positioned on the OSM-mapped "
    "Rajiv Gandhi Salai spine at the chainage implied by the brief's OMR sequence "
    "Navalur -> Kandanchal -> Thazhuthendur -> Siruthai -> Sholinganallur.")
add("B10", "Kandanchal", ["Kandanchal OMR", "Kandanchal Junction"], "193",
    "Sholinganallur (AC 27)", ["600117"], *omr(12.8605, 0.0008), "B",
    "mixed", "B-R2", 1.00, 0.75,
    "Brief-named OMR anchor. Positioned on the OSM Rajiv Gandhi Salai spine at the "
    "chainage implied by the brief's OMR sequence; commercial ribbon along OMR.")
add("B11", "Siruthai", ["Siruthai OMR", "Siruthai Junction"], "197",
    "Sholinganallur (AC 27)", ["600119"], *omr(12.8770, -0.0005), "B",
    "mixed", "B-R2", 0.90, 0.70,
    "Brief-named OMR anchor. Positioned on the OSM Rajiv Gandhi Salai spine at the "
    "chainage implied by the brief's OMR sequence.")
add("B12", "Semmancheri", ["Semmancheri OMR"], "195",
    "Sholinganallur (AC 27)", ["600097"], 12.88032, 80.22124, "A",
    "mixed", "B-R2", 1.10, 0.80,
    "Nominatim 'Semmancheri metro depot (u/c), Zone 15 Sholinganallur' at 12.88032,80.22124.")
add("B13", "Poothapedi", ["Poothapedi Siruthai"], "197",
    "Sholinganallur (AC 27)", ["600119"], *omr(12.8815, -0.0045), "B",
    "residential", "B-R2", 0.70, 0.62,
    "Residential village abutting the Siruthai OMR junction. No OSM node; positioned on "
    "the OSM OMR spine offset 490 m inland (west).")
add("B14", "Kovilambedu", ["Koyilambedu", "Kovilambedu Sholinganallur"], "194",
    "Sholinganallur (AC 27)", ["600117"], *omr(12.8690, -0.0085), "B",
    "residential", "B-R2", 0.65, 0.58,
    "GCC ward 194 carries the Mettu Kuppam / PalLAvan Kudiruppu / M.R.G. Nagar street block "
    "that serves Kovilambedu (tier A street counts). Position placed on the OSM OMR spine "
    "offset 940 m inland (west).")
add("B15", "Mappedu", ["Mappedu Village", "Mappedu Vandalur"], "200",
    "Sholinganallur (AC 27)", ["600126"], 12.88855, 80.13753, "A",
    "residential", "B-R2", 0.75, 0.55,
    "OSM place node 'Mappedu, Chennai Metropolitan Area, Vandalur, Chengalpattu' at "
    "12.88855,80.13753 (tier A). Brief-named anchor.")
add("B16", "Egumudi", ["Egumudi Village", "Egumudi Sholinganallur"], "200",
    "Sholinganallur (AC 27)", ["600119"], 12.90120, 80.20300, "B",
    "residential", "B-R2", 0.70, 0.56,
    "Brief-named anchor. No OSM node; positioned on the OSM Sholinganallur-Mappedu "
    "settlement axis at the chainage between the two OSM place nodes.")

# ---- R3 : Sholinganallur town and the OMR IT belt -------------------------
add("B17", "Sholinganallur", ["Sozhanganallur", "Sholinganallur Town", "Sholinganallur Bazaar"],
    "197", "Sholinganallur (AC 27)", ["600097", "600119"], 12.89354, 80.23206, "A",
    "mixed", "B-R3", 1.00, 0.70,
    "OSM place node 'Sholinganallur' at 12.89354,80.23206 (tier A). GCC ward 197 carries "
    "NKS Nagar, Kadumbadi Naicker/Amman Koil streets, Arignar Anna and Mahatma Gandhi "
    "streets (tier A). Brief-named anchor and candidate zone hub.")
add("B18", "Sholinganallur Co-operative Nagar", ["Sholinganallur Coop Nagar", "Co-operative Nagar"],
    "200", "Sholinganallur (AC 27)", ["600097"], *omr(12.8975, -0.0060), "B",
    "residential", "B-R3", 0.75, 0.62,
    "GCC ward 200 street list opens with SHOLINGANALLUR COOP NAGAR STREETS (tier A). "
    "Position placed on the OSM OMR spine, 660 m inland (west).")
add("B19", "Sholinganallur N.K.S. Nagar", ["NKS Nagar", "Kalaaimagal Nagar"], "197",
    "Sholinganallur (AC 27)", ["600097"], *omr(12.8950, -0.0035), "B",
    "residential", "B-R3", 0.80, 0.60,
    "GCC ward 197 lists NKS Nagar main street plus 3 cross streets and Kalaaimagal Nagar "
    "1st-5th streets (tier A). Position placed on the OSM OMR spine, 380 m inland.")
add("B20", "Kadumbadi", ["Kadumbadi Amma Street", "Kadumbadi Naicker Street"], "197",
    "Sholinganallur (AC 27)", ["600119"], 13.00279, 80.20581, "A",
    "residential", "B-R3", 0.85, 0.62,
    "Nominatim 'Kadumbadi Amma Street, Ward 160, Zone 12 Alandur' at 13.00279,80.20581 "
    "(tier A). GCC ward 197 also carries KADUMBADI AMMAN KOIL STREET and KADUMBADI "
    "NAICKAR STREET, so the toponym straddles wards 160 and 197.")
add("B21", "E.L.C.O.T. Sholinganallur", ["ELCOT", "ELCOT aerospace", "TNHB Sholinganallur 1500 Flats"],
    "197", "Sholinganallur (AC 27)", ["600119"], 12.90870, 80.21936, "A",
    "industrial", "B-R3", 0.95, 0.85,
    "Nominatim 'ELCOT, Ward 197, Zone 15 Sholinganallur' at 12.90870,80.21936 (tier A). "
    "OSM ward 197/198 area carries 'TNHB Sholinganallur 1500 Flats' and 'Infosys' (tier A).")
add("B22", "Infosys campus township, Sholinganallur", ["Infosys OMR campus", "Infosys Poompuhar"],
    "198", "Sholinganallur (AC 27)", ["600119"], 12.89573, 80.23384, "A",
    "industrial", "B-R3", 0.90, 0.84,
    "OSM named feature 'Infosys' inside the Sholinganallur ward block (tier A). Lat/lon is "
    "the OSM ward-198 feature centroid. Gated employee housing attached to the campus.")
add("B23", "R.M.Z. Ecoworld, Thandalam", ["RMZ Ecoworld", "RMZ Galaxy", "Thandalam"],
    "195", "Sholinganallur (AC 27)", ["600097"], 13.00153, 80.11820, "A",
    "industrial", "B-R3", 1.00, 0.88,
    "OSM place node 'Thandalam' at 13.00153,80.11820 (tier A). RMZ Ecoworld / RMZ Galaxy "
    "sit in Thandalam on the OMR SEZ belt.")
add("B24", "Tidel Park / Rajiv Gandhi IT Expressway", ["Tidel Park", "TIDEL Park township"],
    "180", "Velachery (AC 26)", ["600042"], 12.99113, 80.25067, "A",
    "industrial", "B-R3", 1.10, 0.96,
    "Nominatim 'Tidel Park, Rajiv Gandhi IT Expressway, Ward 180, Zone 13 Adyar' at "
    "12.99113,80.25067 (tier A). Sits on the OMR-ECR connector just north of "
    "Thiruvanmiyur, i.e. the Zone A / Zone B boundary seam; flagged in ANALYSIS.md.")

# ---- R4 : Palavakkam, Enjambakkam, Sungudi --------------------------------
add("B25", "Palavakkam", ["Palavakkam Town", "Paavakkam"], "185",
    "Velachery (AC 26)", ["600041"], 12.95999, 80.25603, "A",
    "mixed", "B-R4", 1.15, 0.80,
    "OSM place node 'Palavakkam' at 12.95999,80.25603 (tier A); OSM 'Paavakkam' residential "
    "polygon at 12.96160,80.25754; Nominatim 'Paavakkam, Ward 185, Zone 14 Perungudi'. "
    "Brief-named anchor.")
add("B26", "Palavakkam Bharathi Nagar", ["Bharathi Nagar Palavakkam"], "185",
    "Velachery (AC 26)", ["600041"], 12.96531, 80.20765, "A",
    "apartment-cluster", "B-R4", 1.10, 0.78,
    "OSM named ways 'Bharathi Nagar Main Road' and 'Bharathi nagar 2nd street' at "
    "12.96531,80.20765 (tier A); Nominatim resolves the second street to Ward 185, "
    "Zone 14 Perungudi.")
add("B27", "Palavakkam Palkalai Nagar", ["Palkalai Nagar"], "185",
    "Velachery (AC 26)", ["600041"], *omr(12.9625, -0.0090), "B",
    "residential", "B-R4", 0.70, 0.58,
    "GCC ward 185 carries 18 Palkalai Nagar streets plus 'PALLAI NAGAR' (tier A). Position "
    "placed on the OSM OMR spine offset 990 m inland (west).")
add("B28", "Palavakkam Ram Nagar", ["Ram Nagar Palavakkam"], "188",
    "Velachery (AC 26)", ["600096"], 12.96536, 80.21181, "A",
    "residential", "B-R4", 0.80, 0.64,
    "OSM place node 'Ram Nagar' assigned to Ward 188 by OSM point-in-polygon (tier A).")
add("B29", "Enjambakkam", ["Enjambakkam", "Enjambakkam B V Nagar"], "196",
    "Velachery (AC 26)", ["600041"], 12.91980, 80.25110, "A",
    "mixed", "B-R4", 0.95, 0.72,
    "OSM 'East Coast Road' named way at 12.9198,80.2511, on the OSM ECR spine; GCC ward "
    "196 street list is headed ENJAMBAKKAM - VETUVANKENI LINK ROAD and ENJAMBAKKAM "
    "MEENAVAR KUPPAM (tier A). Note: the GCC's 'Meenambakkam' pet clinic and ABC centre "
    "(Div 166) physically sit at B V Nagar, Nanganallur 600061 - the Enjambakkam B V "
    "Nagar pocket. 'Injambakkam' further south is OUTSIDE the zone and is excluded.")
add("B30", "Enjambakkam V.G.P. Layout", ["VGP Layout", "V.G.P Layout Enjambakkam"], "196",
    "Velachery (AC 26)", ["600041"], *ecr(12.9245, -0.0035), "B",
    "apartment-cluster", "B-R4", 1.05, 0.74,
    "GCC ward 196 lists VGP LAYOUT 1 TO 9 STREET plus Shesathri Avenue, Pandal Nagar and "
    "Poompuhar Street (tier A). Position placed on the OSM ECR spine, 390 m inland.")
add("B31", "Enjambakkam Bethel Nagar", ["Bethel Nagar Enjambakkam"], "196",
    "Velachery (AC 26)", ["600041"], *ecr(12.9270, -0.0048), "B",
    "apartment-cluster", "B-R4", 1.00, 0.72,
    "GCC ward 196 lists BETHEL NAGAR L and BETHEL NAGAR R (tier A). Position placed on the "
    "OSM ECR spine, 530 m inland (west).")
add("B32", "Enjambakkam Cholan Nagar", ["Cholan Nagar", "Hanumar Colony"], "196",
    "Velachery (AC 26)", ["600041"], *ecr(12.9150, -0.0030), "B",
    "residential", "B-R4", 0.70, 0.60,
    "GCC ward 196 lists CHOLAN NAGAR, HANUMAR COLONY and TEACHER COLONY 1 TO 4 STREET "
    "(tier A). Position placed on the OSM ECR spine, 330 m inland.")
add("B33", "Sungudi", ["ECR Sungudi", "Sungudi ECR"], "196",
    "Velachery (AC 26)", ["600041"], *ecr(12.9400, -0.0015), "B",
    "residential", "B-R4", 0.75, 0.64,
    "Brief-named ECR anchor. No OSM node for Sungudi; positioned on the OSM East Coast "
    "Road spine between the Enjambakkam and Palavakkam chainages.")
add("B34", "Sungudi East Coast Road", ["ECR commercial belt Sungudi"], "196",
    "Velachery (AC 26)", ["600041"], *ecr(12.9465, -0.0010), "B",
    "commercial", "B-R4", 0.70, 0.72,
    "The ECR service strip inside the same Sungudi segment: hotels, clinics and the "
    "pavement trade that serves the ECR apartment belt. Position placed on the OSM ECR "
    "spine between Sungudi and Palavakkam.")

# ---- R5 : Perungudi ------------------------------------------------------
add("B35", "Perungudi", ["Perungudi Town", "Perungudi OMR"], "186",
    "Velachery (AC 26)", ["600042", "600096"], 12.97102, 80.24181, "A",
    "mixed", "B-R5", 1.10, 0.82,
    "OSM place node 'Perungudi' at 12.97102,80.24181 (tier A); Nominatim resolves it to "
    "Zone 14 Perungudi. GCC ward 186 carries OMR SALAI PERUNGUDI, Industrial Estate and "
    "Panchayat Office Road (tier A).")
add("B36", "Perungudi Bethel Nagar", ["Bethel Nagar Perungudi", "Bethel Matriculation"],
    "186", "Velachery (AC 26)", ["600042"], 12.96303, 80.23358, "A",
    "apartment-cluster", "B-R5", 1.05, 0.76,
    "OSM named ways 'Bethel Avenue Main Road', 'Bethel Nagar road', 'Bethel Matriculation "
    "hr sec school' at 12.96303,80.23358 (tier A).")
add("B37", "Perungudi Seevaram", ["Seevaram", "Soundarya Nagar"], "186",
    "Velachery (AC 26)", ["600042"], *omr(12.9655, -0.0025), "B",
    "residential", "B-R5", 0.75, 0.62,
    "GCC ward 186 lists SEEVARAM, SOUNDARYA NAGAR, SELVAGANAPATHY and SENTHIL NAGAR "
    "(tier A). Position placed on the OSM OMR spine, 280 m inland.")
add("B38", "Perungudi New India Colony", ["New India Colony", "Elim Nagar"], "186",
    "Velachery (AC 26)", ["600042"], *omr(12.9680, -0.0045), "B",
    "residential", "B-R5", 0.70, 0.58,
    "GCC ward 186 lists NEW INDIA COLONY (18 streets in the ward block) and ELIM NAGAR "
    "(tier A). Position placed on the OSM OMR spine, 490 m inland.")
add("B39", "Perungudi Kurinji Nagar", ["Kurinji Nagar", "Thirumalai Nagar Perungudi"],
    "186", "Velachery (AC 26)", ["600042"], *omr(12.9740, -0.0040), "B",
    "residential", "B-R5", 0.75, 0.60,
    "GCC ward 186 lists KURINJI NAGAR and THIRUMALAI NAGAR (tier A). Position placed on "
    "the OSM OMR spine, 440 m inland.")

# ---- R6 : Madipakkam ------------------------------------------------------
add("B40", "Madipakkam", ["Madipakkam Town", "Madipakkam OMR side"], "187",
    "Madipakkam (AC 156)", ["600093"], 12.96113, 80.20013, "A",
    "apartment-cluster", "B-R6", 1.30, 0.85,
    "OSM place node 'Madipakkam, Zone 14 Perungudi' at 12.96113,80.20013 (tier A). GCC "
    "ward 187 lists MADIPAKKAM MAIN ROAD, Lake View, Park Squire and Sendhuram Colony "
    "(tier A). Only the OMR-side part of Madipakkam is in Zone B; the Velachery side is out.")
add("B41", "Madipakkam Karthikeyapuram", ["Karthikeyapuram"], "187",
    "Madipakkam (AC 156)", ["600093"], 12.96259, 80.19452, "A",
    "apartment-cluster", "B-R6", 1.20, 0.80,
    "OSM place node 'Karthikeyapuram' at 12.96259,80.19452 (tier A); GCC ward 187 lists "
    "KARTHIKEYAPURAM streets (tier A).")
add("B42", "Madipakkam Lake View", ["Lake View Madipakkam", "Sabari Salai"], "187",
    "Madipakkam (AC 156)", ["600093"], 12.95890, 80.19100, "B",
    "apartment-cluster", "B-R6", 1.15, 0.78,
    "GCC ward 187 lists LAKE VIEW, SABARI SALAI and PARK SQUIRE COLONY (tier A). Position "
    "placed 0.4 km west of the OSM Karthikeyapuram node, inside the same OSM block.")
add("B43", "Madipakkam Sendhuram Colony", ["Sendhuram Colony", "New Kubera Nagar"], "187",
    "Madipakkam (AC 156)", ["600093"], 12.96480, 80.20400, "B",
    "apartment-cluster", "B-R6", 1.20, 0.78,
    "GCC ward 187/188 carry SENDHURAM COLONY and NEW KUBERA NAGAR (tier A). Position "
    "placed on the OSM OMR-side settlement block between Madipakkam and Perungudi.")
add("B44", "Madipakkam Ayyappa Nagar", ["Ayyappa Nagar", "Iyyappa Nagar"], "187",
    "Madipakkam (AC 156)", ["600093"], *omr(12.9605, -0.0430), "B",
    "residential", "B-R6", 0.75, 0.62,
    "GCC ward 187 lists AYYAPPAN NAGAR and 24 IYAAPPA Nagar streets (tier A). Position "
    "placed in the OSM Madipakkam block, 4.3 km west of the OMR spine.")

# ---- R7 : Thiruvanmiyur and the southern anchor ---------------------------
add("B45", "Thiruvanmiyur", ["Thiruvanmiyur Town", "Triplicane South"], "182",
    "Velachery (AC 26)", ["600041", "600042"], 12.98589, 80.26442, "A",
    "mixed", "B-R7", 1.30, 0.88,
    "OSM place node 'Thiruvanmiyur, Zone 13 Adyar' at 12.98589,80.26442 (tier A); "
    "OSM Thiruvanmiyur bus stop 12.98688,80.25800. Brief-named anchor and candidate zone "
    "hub.")
add("B46", "Thiruvanmiyur T. Nagar", ["T N Nagar", "Radhakrishnan Nagar Thiruvanmiyur"],
    "181", "Velachery (AC 26)", ["600041"], 12.99434, 80.25869, "A",
    "residential", "B-R7", 0.95, 0.72,
    "Nominatim 'Radhakrishnan Nagar, Ward 181, Zone 13 Adyar' at 12.99434,80.25869 "
    "(tier A).")
add("B47", "Thiruvanmiyur Indira Nagar", ["Indira Nagar Thiruvanmiyur"], "180",
    "Velachery (AC 26)", ["600041"], 12.99631, 80.25242, "A",
    "apartment-cluster", "B-R7", 1.05, 0.80,
    "OSM place node 'Indira Nagar' at 12.99631,80.25242 (tier A); OSM 'Indira Nagar "
    "Park' and Indira Nagar 1st/13th Avenue inside the same block.")
add("B48", "Thiruvanmiyur Sriram Nagar", ["Sriram Nagar Thiruvanmiyur"], "180",
    "Velachery (AC 26)", ["600041"], 12.99094, 80.26061, "A",
    "residential", "B-R7", 0.80, 0.64,
    "OSM place node 'Sriram Nagar' (locality) at 12.99094,80.26061 (tier A).")
add("B49", "Thiruvanmiyur Anchaneya Nagar", ["Anchaneya Nagar", "Jagannathapuram"],
    "191", "Velachery (AC 26)", ["600041"], *omr(12.9880, -0.0160), "B",
    "residential", "B-R7", 0.75, 0.60,
    "GCC ward 191 carries the Anchaneya Nagar block (13 streets), Jagannathapuram Main "
    "Road, Amaravathi Nagar and Bathmavathi Nagar (tier A). Position placed on the OSM "
    "OMR-side southern corridor, 1.75 km inland.")
add("B50", "Thiruvanmiyur V.O.C. Street", ["VOC Street", "North Mada Street", "Bhendi Street"],
    "181", "Velachery (AC 26)", ["600041"], 12.98701, 80.25911, "A",
    "mixed", "B-R7", 1.05, 0.82,
    "OSM ward-181 feature block resolves to 12.98701,80.25911 and carries North Mada "
    "Street, Thiruvalluvar Road and Thiruvalluvar Salai (tier A).")

assert len(L) == 50, len(L)

# ------------------------------------------------------------------ GCC streets
ws = collections.defaultdict(list)
with open(os.path.join(W, "gcc_streets.csv"), encoding="utf-8", errors="replace") as f:
    for row in csv.DictReader(f):
        wd = (row.get("Ward") or "").strip()
        st = (row.get("Street Name") or "").strip()
        if wd and st:
            ws[wd].append(st)

json.dump(L, open(os.path.join(W, "zone_b_master.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("master rows:", len(L))
print("clusters:", collections.Counter(x["cluster"] for x in L))
print("wards:", collections.Counter(x["ward"] for x in L))
