// Shared heading-anchor logic. The build script and the remark plugin must
// agree exactly, otherwise the table of contents links to anchors that do not
// exist. One implementation, imported by both.

const seen = new Map();

export function slugify(text, prefix = '') {
  const base = String(text)
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/&amp;/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const key = prefix ? `${prefix}:${base}` : base;
  const n = seen.get(key) ?? 0;
  seen.set(key, n + 1);
  return n === 0 ? base : `${base}-${n}`;
}

export function resetSlugs() {
  seen.clear();
}
