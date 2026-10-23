// Screenshot pass for the dossier route. Captures the top of the page, the
// figures, the tables and the mobile layout, so a fix can be made in one
// batch instead of a screenshot loop.

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
const URL = `${server.origin}/zones/index.html`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--font-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');

  await page.screenshot({ path: resolve(shots, 'zones-top.png') });

  const figure = await page.$('.chart');
  if (figure) {
    await figure.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: resolve(shots, 'zones-chart.png') });
  }

  const map = await page.$('#routemap');
  if (map) {
    await map.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await new Promise((r) => setTimeout(r, 1600));
    await page.screenshot({ path: resolve(shots, 'zones-map.png') });
  }

  const flow = await page.$('#flow');
  if (flow) {
    await flow.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: resolve(shots, 'zones-flow.png') });
  }

  const board = await page.$('#board');
  if (board) {
    await board.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: resolve(shots, 'zones-board.png') });
  }

  const table = await page.$('.doc table');
  if (table) {
    await table.evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: resolve(shots, 'zones-table.png') });
  }

  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await mobile.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await mobile.evaluateHandle('document.fonts.ready');
  await mobile.screenshot({ path: resolve(shots, 'zones-mobile.png') });

  const mTable = await mobile.$('.doc table');
  if (mTable) {
    await mTable.evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await new Promise((r) => setTimeout(r, 250));
    await mobile.screenshot({ path: resolve(shots, 'zones-mobile-table.png') });
  }

  console.log('shots written to .shots');
} finally {
  await browser.close();
  await server.close();
}
