// Stitches a full-page capture from viewport-sized segments.
//
// Chrome's compositor caps a single surface at 16384px. Any taller capture is
// re-rendered from scroll zero, so the top of the page appears twice and the
// real tail is missing. Capturing the document in segments and joining the
// pixels here is the only way to get a true full-page image.

import { PNG } from 'pngjs';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function stitch(segments, outFile) {
  const parts = [];
  for (const seg of segments) {
    parts.push(await PNG.sync.read(await readFile(seg)));
  }

  const width = parts[0].width;
  const height = parts.reduce((sum, p) => sum + p.height, 0);

  const out = new PNG({ width, height });
  let y = 0;
  for (const p of parts) {
    PNG.bitblt(p, out, 0, 0, p.width, p.height, 0, y);
    y += p.height;
  }

  await writeFile(outFile, PNG.sync.write(out));
  for (const seg of segments) await unlink(seg).catch(() => {});

  return { width, height };
}
