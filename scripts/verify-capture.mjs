// Verifies that a full-page capture is not Chrome's captureBeyondViewport
// duplicate: no row at y >= 16384 may match the row 16384px earlier.

import puppeteer from 'puppeteer-core';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const targets = process.argv.slice(2);
if (!targets.length) {
  console.error('usage: node scripts/verify-capture.mjs <png> [png...]');
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox'],
});

try {
  const page = await browser.newPage();
  await page.goto('about:blank');

  for (const name of targets) {
    const path = resolve(root, name);
    const data = (await readFile(path)).toString('base64');
    const result = await page.evaluate(
      (b64) =>
        new Promise((done) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width;
            c.height = img.height;
            const g = c.getContext('2d');
            g.drawImage(img, 0, 0);
            const sig = (y) => {
              const d = g.getImageData(0, y, img.width, 1).data;
              let h = 0;
              for (let i = 0; i < d.length; i += 4) {
                h = (h * 31 + d[i] * 7 + d[i + 1] * 13 + d[i + 2] * 17) >>> 0;
              }
              return h;
            };
            const LIMIT = 16384;
            let checked = 0;
            let matched = 0;
            let firstMismatch = -1;
            for (let y = LIMIT; y < img.height; y += 7) {
              checked++;
              if (sig(y) === sig(y - LIMIT)) matched++;
              else if (firstMismatch === -1) firstMismatch = y;
            }
            done({
              width: img.width,
              height: img.height,
              checked,
              matched,
              firstMismatch,
              // a genuine document has many different rows past the seam
              distinct: new Set(Array.from({ length: 40 }, (_, i) => sig(LIMIT + i * 97))).size,
            });
          };
          img.src = 'data:image/png;base64,' + b64;
        }),
      data
    );

    const ok = result.matched === 0;
    console.log(
      `${name}  ${result.width}x${result.height}  rows past 16384 sampled ${result.checked}, ` +
        `matching the row 16384 earlier: ${result.matched}  distinct rows after the seam: ${result.distinct}/40  ` +
        `=> ${ok ? 'CLEAN' : 'DUPLICATED SEAM'}`
    );
    if (!ok) process.exitCode = 1;
  }
} finally {
  await browser.close();
}
