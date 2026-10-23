// Renders the print route to a PDF with the installed Chrome.
//
// The print route is the same report as the website, set in the same type and
// palette, so the PDF can never drift from the site. Chrome is driven through
// puppeteer-core so the footer can carry a real page number.

import puppeteer from 'puppeteer-core';
import { mkdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './static-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT_DIR = resolve(root, 'pdf');

// The script renders either document. The page path, the file name and the
// footer label are arguments so the same renderer serves the market report and
// the locality dossier without a second copy of the print logic.
const PAGE_PATH = process.argv[2] ?? '/print/index.html';
const OUT_NAME = process.argv[3] ?? 'mobile-vet-chennai-coimbatore-report.pdf';
const FOOTER_LABEL =
  process.argv[4] ?? 'Mobile Veterinary Practice &mdash; Chennai and Coimbatore &nbsp;·&nbsp; MVT-CHN-001';

const OUT_FILE = resolve(OUT_DIR, OUT_NAME);

await mkdir(OUT_DIR, { recursive: true });

// Served over HTTP for the same reason as the screenshots: the Astro bundle
// uses an absolute path and would not load from disk.
const server = await startStaticServer(resolve(root, 'dist'));
const PAGE = `${server.origin}${PAGE_PATH}`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'],
});

try {
  const page = await browser.newPage();
  await page.goto(PAGE, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');

  const footer = `
    <div style="width:100%;font-family:'Roboto Mono',monospace;font-size:7pt;color:#6b6862;
                padding:0 14mm;display:flex;justify-content:space-between;align-items:center;">
      <span>${FOOTER_LABEL}</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`;

  await page.pdf({
    path: OUT_FILE,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: footer,
    margin: { top: '16mm', right: '14mm', bottom: '20mm', left: '14mm' },
  });

  const info = await stat(OUT_FILE);
  console.log(`pdf      ${OUT_FILE}`);
  console.log(`size     ${(info.size / 1024).toFixed(0)} kB`);
} finally {
  await browser.close();
  await server.close();
}
