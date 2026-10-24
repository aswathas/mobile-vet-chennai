# Map Geometry Sources

**Generated:** 2026-10-24T08:09:52.726Z
**Endpoint:** https://overpass-api.de/api/interpreter
**Attribution:** OpenStreetMap contributors, licensed under the Open Database License (ODbL).

## Overpass Query

```overpass
[out:json][timeout:90];
(
  way["natural"="coastline"](12.82,79.70,13.06,80.35);
  relation["natural"="coastline"](12.82,79.70,13.06,80.35);
  way["name"~"Rajiv Gandhi Salai|East Coast Road|Grand Southern Trunk|Outer Ring Road"](12.82,79.70,13.06,80.35);
);
out geom;
```

## Elements Fetched

Total elements: 358

- Coastline ways: 11
- Rajiv Gandhi Salai ways: 58
- East Coast Road ways: 47
- Grand Southern Trunk Road ways: 87
- Outer Ring Road ways: 155
