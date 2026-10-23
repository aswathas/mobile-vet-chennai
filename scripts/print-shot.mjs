// Visual check of the print route. Chrome's print engine and its screen
// engine are the same, so emulating print media at A4 width shows the page
// as the PDF will set it.

import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './static-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const shots = resolve(root, '.shots');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

await mkdir(shots, { recursive: true });

const server = await startStaticServer(resolve(root, 'dist'));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});

try {
  const page = await browser.newPage();
  // A4 at 96dpi
  const A4 = { width: 794, height: 1123 };
  await page.setViewport({ ...A4, deviceScaleFactor: 2 });
  await page.emulateMediaType('print');
  await page.goto(`${server.origin}/print/index.html`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise((r) => setTimeout(r, 500));

  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`print doc height  ${total}px  (${(total / 1123).toFixed(1)} A4 pages)`);

  // the opening pages and the closing pages, where the layout is most likely
  // to break
  const lastPage = Math.max(0, Math.ceil(total / A4.height) - 1);
  const targets = [0, 1, 2, lastPage];
  for (const p of new Set(targets)) {
    await page.evaluate((y) => window.scrollTo(0, y), p * A4.height);
    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({
      path: resolve(shots, `print-p${p + 1}.png`),
      clip: { x: 0, y: p * A4.height, width: A4.width, height: A4.height },
    });
  }
  console.log(`captured         slices ${[...new Set(targets)].map((p) => p + 1).join(', ')}`);
} finally {
  await browser.close();
  await server.close();
}
