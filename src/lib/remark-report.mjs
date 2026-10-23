// Remark plugin for the report body.
//
// Two jobs, both of which must stay in step with scripts/build-content.mjs:
//   1. give every heading the same anchor id the outline uses, so the table of
//      contents links resolve;
//   2. turn a bracketed citation marker such as [47] into a superscript link
//      to the matching entry in the reference list.
//
// It never adds, removes or rewrites a claim. It only reshapes markup.

import { slugify, resetSlugs } from './slug.mjs';

// The decisive values in the report. A table cell holding exactly one of these
// is marked so the stylesheet can flag it the way a lab form flags an
// out-of-range result. This is a presentational mark, not an editorial one:
// the list mirrors the figures the content build already verifies.
const FLAG_VALUES = new Set([
  'Rs 1,100',
  'Rs 1,199',
  'Rs 1,499',
  'Rs 850',
  'Rs 841',
  '68,736',
  '78,392',
  'Rs 6,800',
  'Rs 2,800',
]);


function splitCitations(value) {
  const parts = value.split(/(\[\d{1,3}\])/);
  if (parts.length === 1) return [{ type: 'text', value }];
  const out = [];
  for (const part of parts) {
    const m = /^\[(\d{1,3})\]$/.exec(part);
    if (!m) {
      if (part) out.push({ type: 'text', value: part });
      continue;
    }
    out.push({
      type: 'link',
      url: `#ref-${m[1]}`,
      title: `Source ${m[1]}`,
      data: { hProperties: { className: ['cite'], 'aria-label': `Source ${m[1]}` } },
      children: [{ type: 'text', value: m[1] }],
    });
  }
  return out;
}

function walk(node, visit) {
  if (!node.children) return;
  for (const child of node.children) {
    visit(child);
    walk(child, visit);
  }
}

export function remarkReport() {
  return (tree) => {
    resetSlugs();

    walk(tree, (node) => {
      if (node.type !== 'heading') return;
      const text = node.children.map((c) => c.value ?? '').join('');
      const id = slugify(text);
      node.data = node.data || {};
      node.data.hProperties = { ...(node.data.hProperties || {}), id };
    });

    // Each cell carries the column it belongs to, so a table can be stacked
    // into labelled rows on a narrow screen instead of being cut off.
    walk(tree, (node) => {
      if (node.type !== 'table') return;
      const header = node.children.find((c) => c.type === 'tableRow');
      if (!header) return;
      const labels = header.children.map((cell) =>
        cell.children.map((c) => c.value ?? '').join('').trim()
      );
      for (const row of node.children) {
        if (row.type !== 'tableRow') continue;
        row.children.forEach((cell, i) => {
          cell.data = cell.data || {};
          cell.data.hProperties = {
            ...(cell.data.hProperties || {}),
            'data-label': labels[i] ?? '',
          };
        });
      }
    });

    const rewrite = (node) => {
      if (!node.children) return;
      const out = [];
      for (const child of node.children) {
        if (child.type === 'text') {
          out.push(...splitCitations(child.value));
        } else {
          rewrite(child);
          out.push(child);
        }
      }
      node.children = out;
    };
    rewrite(tree);
  };
}
