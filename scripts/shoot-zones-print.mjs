// Captures the dossier's print route as A4 slices, so the PDF's pagination and
// table layout can be checked without a PDF renderer.

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
const URL = `${server.origin}/zones-print/index.html`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--font-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
  await page.emulateMediaType('print');
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');

  const height = await page.evaluate(() => document.body.scrollHeight);
  const pages = Math.min(Math.ceil(height / 1123), 12);

  for (let i = 0; i < pages; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 1123);
    await new Promise((r) => setTimeout(r, 150));
    await page.screenshot({ path: resolve(shots, `zones-print-p${i + 1}.png`) });
  }

  console.log(`print height ${height}px, captured ${pages} slices`);
} finally {
  await browser.close();
  await server.close();
}
