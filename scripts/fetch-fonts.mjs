// Downloads the typefaces as static woff2 assets so the site has no runtime
// dependency on a font CDN and the printed PDF renders identically offline.
//
// Two families only: one condensed grotesk for the whole document, and a mono
// for parameters. Filenames are sanitised because a percent sign in a filename
// breaks CSS url() parsing.
//
// Run: node scripts/fetch-fonts.mjs
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = new URL('../public/fonts/', import.meta.url).pathname.replace(/^\//, '');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const FAMILIES = [
  { css: 'Public+Sans:wght@200..900', slug: 'public-sans', file: 'public-sans-var' },
  // The two weights are requested separately. Asking for both in one query
  // returns the same file twice under two names, and the 500 face never
  // exists on disk.
  { css: 'Roboto+Mono:wght@400', slug: 'roboto-mono-400', file: 'roboto-mono-normal-400' },
  { css: 'Roboto+Mono:wght@500', slug: 'roboto-mono-500', file: 'roboto-mono-normal-500' },
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const faces = [];

for (const fam of FAMILIES) {
  const url = `https://fonts.googleapis.com/css2?family=${fam.css}&display=swap`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${fam.slug}: css fetch failed ${res.status}`);
  const css = await res.text();

  const blocks = css.split('/*').filter((b) => b.trim().startsWith('latin */'));
  let i = 0;
  for (const block of blocks) {
    const body = block.slice(block.indexOf('*/') + 2);
    const style = /font-style:\s*italic/.test(body) ? 'italic' : 'normal';
    const weight = /font-weight:\s*([\d\s]+)/.exec(body)?.[1]?.trim() ?? '400';
    const stretch = /font-stretch:\s*([^;]+)/.exec(body)?.[1]?.trim();
    const family = /font-family:\s*'([^']+)'/.exec(body)?.[1];
    const m = /url\((https:[^)]+\.woff2)\)/.exec(body);
    if (!m) continue;

    const suffix = fam.file ?? `${fam.slug}-${style}-${weight.replace(/\s+/g, '-')}`;
    const file = `${suffix}${i ? '-' + i : ''}.woff2`;
    i += 1;

    const bin = await fetch(m[1], { headers: { 'User-Agent': UA } });
    if (!bin.ok) throw new Error(`${file}: font fetch failed ${bin.status}`);
    const bytes = Buffer.from(await bin.arrayBuffer());
    await writeFile(join(OUT, file), bytes);

    faces.push(
      [
        '@font-face {',
        `  font-family: '${family}';`,
        `  src: url('${file}') format('woff2');`,
        `  font-weight: ${weight};`,
        `  font-style: ${style};`,
        stretch ? `  font-stretch: ${stretch};` : '',
        '  font-display: swap;',
        '}',
      ]
        .filter(Boolean)
        .join('\n')
    );
    console.log(`${file}  ${(bytes.length / 1024).toFixed(1)} kB  ${family} ${style} ${weight}${stretch ? ' ' + stretch : ''}`);
  }
}

await writeFile(join(OUT, 'fonts.css'), faces.join('\n\n') + '\n', 'utf8');
console.log(`\n${faces.length} faces written to public/fonts/fonts.css`);
