// Merges the two research passes' source lists into one numbered list.
//
// The passes write SOURCES.md as headed sections, each with a two-column table
// of dataset, URL, publisher and fields used. This reads both files, takes one
// entry per section with its headline URL, drops duplicates by URL, and writes
// research/merged/sources.json. The dossier's reference list is built from that
// file, so a source appears once and keeps the number it was given here.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESEARCH = process.env.MVT_RESEARCH ?? 'research';
const OUT = join(root, RESEARCH, 'merged');

const files = [
  { zone: 'A', path: join(root, RESEARCH, 'zone-a', 'SOURCES.md') },
  { zone: 'B', path: join(root, RESEARCH, 'zone-b', 'SOURCES.md') },
];

const seen = new Map();
const order = [];

function addSource(label, url, zone, publisher) {
  const clean = url.replace(/[.,;]$/, '');
  if (seen.has(clean)) {
    const entry = seen.get(clean);
    if (publisher && !entry.publisher) entry.publisher = publisher;
    if (!entry.zones.includes(zone)) entry.zones.push(zone);
    return;
  }
  const entry = { label, url: clean, publisher: publisher || '', zones: [zone] };
  seen.set(clean, entry);
  order.push(entry);
}

function cleanLabel(text) {
  return text
    .replace(/\((?:tier\s+[ABC]|tier)\s*[ABC]?\)/gi, '')
    .replace(/—\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

for (const f of files) {
  let raw;
  try {
    raw = await readFile(f.path, 'utf8');
  } catch {
    console.log(`missing ${f.path}, skipped`);
    continue;
  }

  const lines = raw.split(/\r?\n/);
  let section = null;
  let publisher = '';

  for (const line of lines) {
    const h = line.match(/^#{2,3}\s+(.*)$/);
    if (h) {
      // A section heading opens a source. Its first URL is the entry's URL.
      section = { label: cleanLabel(h[1].replace(/^\d+\.\s*/, '')), url: null };
      publisher = '';
      const inline = h[1].match(/https?:\/\/[^\s)\]"'<>]+/);
      if (inline) {
        addSource(section.label, inline[0], f.zone, '');
        section.url = inline[0];
      }
      continue;
    }

    const urls = line.match(/https?:\/\/[^\s)\]"'<>]+/g);
    if (!urls) continue;

    const p = line.match(/\|\s*\*\*Publisher\*\*\s*\|\s*(.+?)\s*\|/);
    if (p) publisher = p[1].replace(/\*\*|`/g, '').trim();

    for (const url of urls) {
      if (section) {
        if (!section.url) {
          section.url = url;
          addSource(section.label, url, f.zone, publisher);
        } else if (url !== section.url) {
          // A second URL in the same section is a corroborating source, not a
          // separate entry. It is recorded on the entry's own line.
          const entry = seen.get(section.url.replace(/[.,;]$/, ''));
          if (entry) entry.also = [...(entry.also || []), url.replace(/[.,;]$/, '')];
        }
      } else {
        const label = cleanLabel(line.replace(/https?:\/\/[^\s)\]"'<>]+/g, '').replace(/^[|\s>*\-#0-9.]+/, ''));
        if (label.length > 3) addSource(label, url, f.zone, '');
      }
    }
  }
}

const sources = order.map((s, i) => ({
  n: i + 1,
  label: s.label,
  publisher: s.publisher,
  url: s.url,
  also: s.also || [],
  zones: s.zones,
}));

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, 'sources.json'), JSON.stringify(sources, null, 2) + '\n', 'utf8');

console.log(`sources merged: ${sources.length}`);
for (const s of sources) console.log(`  ${String(s.n).padStart(2)}. [${s.zones.join('')}] ${s.label.slice(0, 88)}`);
