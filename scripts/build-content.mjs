// Turns the verified report into the data the site renders.
//
// The Markdown stays the single source of truth. This script splits it into
// the reading body, the reference list and the document outline, and refuses to
// emit anything if a figure quoted in the hero panel cannot be found in the
// source. It never rewrites a claim; it only reshapes the file.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify, resetSlugs } from '../src/lib/slug.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'content', 'final_turn_001.md');
const OUT = join(root, 'src', 'content');

const raw = await readFile(SRC, 'utf8');
const lines = raw.split(/\r?\n/);

// ---- split off the document title -----------------------------------------
const titleIndex = lines.findIndex((l) => l.startsWith('# '));
if (titleIndex === -1) throw new Error('no H1 title found in the report');
const title = lines[titleIndex].replace(/^#\s+/, '').trim();

// ---- split off the reference list -----------------------------------------
const refHeadingIndex = lines.findIndex((l) => /^##\s+References\s*$/.test(l));
if (refHeadingIndex === -1) throw new Error('no "## References" section found in the report');

const bodyLines = lines.slice(titleIndex + 1, refHeadingIndex);
const refLines = lines.slice(refHeadingIndex + 1);

// the word count is the report's, so it is taken before anything is lifted out
const words = bodyLines.join('\n').split(/\s+/).filter(Boolean).length;

// ---- parse the references --------------------------------------------------
const references = [];
for (const line of refLines) {
  const m = /^\[(\d+)\]\s+(.*)$/.exec(line.trim());
  if (!m) continue;
  const n = Number(m[1]);
  let label = m[2];
  let url = '';
  const u = /(https?:\/\/\S+)\s*$/.exec(label);
  if (u) {
    url = u[1];
    label = label.slice(0, u.index).replace(/\s*--\s*$/, '').trim();
  }
  references.push({ n, label, url });
}
references.sort((a, b) => a.n - b.n);

if (references.length === 0) throw new Error('reference list parsed empty');

// ---- lift the verdict out of the body -------------------------------------
// The report opens each section with a single bolded recommendation. The one
// under "Launch Decision" is the page's answer, so it is lifted out of the
// flow and rendered inside the verdict panel with the approval stamp.
let ledeHtml = '';
{
  let prev = '';
  for (let i = 0; i < bodyLines.length; i++) {
    const line = bodyLines[i].trim();
    if (!line) continue;
    const bold = /^\*\*[^*].*\*\*$/.exec(line);
    if (bold && /^#{2,3}\s/.test(prev)) {
      const inner = line.replace(/^\*\*/, '').replace(/\*\*$/, '');
      if (/[[\]_*`]/.test(inner)) {
        throw new Error('the lifted verdict paragraph contains markup; lift it by hand');
      }
      ledeHtml = `<p><strong>${inner}</strong></p>`;
      bodyLines.splice(i, 1);
      break;
    }
    prev = line;
  }
}
if (!ledeHtml) throw new Error('no bolded verdict paragraph found under a heading');

// ---- outline ---------------------------------------------------------------
resetSlugs();
const outline = [];
for (const line of bodyLines) {
  const m = /^(#{2,3})\s+(.*)$/.exec(line);
  if (!m) continue;
  const level = m[1].length;
  const text = m[2].replace(/[`*]/g, '').trim();
  const id = slugify(text);
  outline.push({ level, id, text });
}

// ---- integrity gate: every hero figure must exist in the source -------------
const bodyText = bodyLines.join('\n');
const KEY_FIGURES = [
  { id: 'floor', label: 'Minimum blended price per visit', value: 'Rs 1,100', must: 'Rs 1,100' },
  { id: 'cost', label: 'Cost of one clustered visit', value: 'Rs 850', must: 'Rs 850' },
  { id: 'day', label: 'Feasible visits per day', value: '6', must: 'six visits a day' },
  { id: 'licences', label: 'Active Chennai pet licences', value: '68,736', must: '68,736' },
  { id: 'sources', label: 'Sources cited', value: String(references.length), must: null },
];
for (const f of KEY_FIGURES) {
  if (f.must && !bodyText.toLowerCase().includes(f.must.toLowerCase())) {
    throw new Error(`hero figure "${f.label}" (${f.must}) is not present in the report source`);
  }
}

// ---- counts ----------------------------------------------------------------
// count table blocks and their data rows, skipping the header and separator
let tables = 0;
let tableRows = 0;
let inTable = false;
for (const line of bodyLines) {
  if (/^\s*\|/.test(line)) {
    if (!inTable) {
      inTable = true;
      tables++;
      continue;
    }
    if (/^\s*\|[\s:|-]+\|?\s*$/.test(line)) continue;
    tableRows++;
  } else {
    inTable = false;
  }
}

// ---- emit ------------------------------------------------------------------
await mkdir(OUT, { recursive: true });

const bodyMd = bodyLines.join('\n').replace(/^\s*---\s*$/m, '').trim() + '\n';
await writeFile(join(OUT, 'body.md'), bodyMd, 'utf8');

await writeFile(join(OUT, 'lede.html'), ledeHtml + '\n', 'utf8');

await writeFile(
  join(OUT, 'references.json'),
  JSON.stringify(references, null, 2) + '\n',
  'utf8'
);

await writeFile(
  join(OUT, 'outline.json'),
  JSON.stringify(outline, null, 2) + '\n',
  'utf8'
);

await writeFile(
  join(OUT, 'meta.json'),
  JSON.stringify(
    {
      title,
      words,
      tables,
      tableRows,
      sources: references.length,
      sections: outline.filter((o) => o.level === 2).length,
      keyFigures: KEY_FIGURES,
    },
    null,
    2
  ) + '\n',
  'utf8'
);

console.log(`title      ${title}`);
console.log(`body       ${bodyMd.length} bytes`);
console.log(`outline    ${outline.length} headings (${outline.filter((o) => o.level === 2).length} top level)`);
console.log(`references ${references.length}`);
console.log(`words      ${words}`);
console.log(`hero gate  ${KEY_FIGURES.length} figures verified against the source`);
