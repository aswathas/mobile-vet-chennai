import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(root, 'research', 'map-geometry');
const OUT_FILE = join(OUT_DIR, 'osm-coast-and-spines.json');
const SOURCES_FILE = join(OUT_DIR, 'SOURCES.md');

const BBOX = '12.82,79.70,13.06,80.35';

const query = `[out:json][timeout:90];
(
  way["natural"="coastline"](${BBOX});
  relation["natural"="coastline"](${BBOX});
  way["name"~"Rajiv Gandhi Salai|East Coast Road|Grand Southern Trunk|Outer Ring Road"](${BBOX});
);
out geom;`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log('Fetching OSM geometry from Overpass API...');

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  let data = null;
  let usedEndpoint = '';
  for (const ep of endpoints) {
    try {
      console.log(`Trying ${ep}...`);
      const res = await fetch(ep, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: {
          'User-Agent': 'mobile-vet-report-research/1.0 (internal map figure)'
        }
      });
      if (!res.ok) {
        console.warn(`${ep} returned status ${res.status}`);
        continue;
      }
      data = await res.json();
      usedEndpoint = ep;
      break;
    } catch (e) {
      console.warn(`Failed ${ep}: ${e.message}`);
    }
  }

  if (!data || !data.elements || data.elements.length === 0) {
    console.error('Failed to fetch OSM geometry or empty response');
    process.exit(1);
  }

  console.log(`Received ${data.elements.length} elements from ${usedEndpoint}`);
  await writeFile(OUT_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Wrote ${OUT_FILE}`);

  const timestamp = new Date().toISOString();
  const sourcesMd = `# Map Geometry Sources

**Generated:** ${timestamp}
**Endpoint:** ${usedEndpoint}
**Attribution:** OpenStreetMap contributors, licensed under the Open Database License (ODbL).

## Overpass Query

\`\`\`overpass
${query}
\`\`\`

## Elements Fetched

Total elements: ${data.elements.length}

- Coastline ways: ${data.elements.filter(e => e.tags?.natural === 'coastline').length}
- Rajiv Gandhi Salai ways: ${data.elements.filter(e => /Rajiv Gandhi Salai/i.test(e.tags?.name || '')).length}
- East Coast Road ways: ${data.elements.filter(e => /East Coast Road/i.test(e.tags?.name || '')).length}
- Grand Southern Trunk Road ways: ${data.elements.filter(e => /Grand Southern Trunk/i.test(e.tags?.name || '')).length}
- Outer Ring Road ways: ${data.elements.filter(e => /Outer Ring Road/i.test(e.tags?.name || '')).length}
`;

  await writeFile(SOURCES_FILE, sourcesMd, 'utf8');
  console.log(`Wrote ${SOURCES_FILE}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
