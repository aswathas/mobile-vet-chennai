// The stills the map ships with: the figure on the site at a desktop and a
// phone width, the figure hovered, the figure selected, the figure in the
// print twin, and the whole corpus in the "all" view.
//
// These are the pictures a reviewer reads instead of running the site.

import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './static-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const shots = resolve(root, 'shots');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

await mkdir(shots, { recursive: true });

const server = await startStaticServer(resolve(root, 'dist'));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--font-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});

/**
 * Scrolls the figure into view and waits for the smooth scroll to settle.
 * The gantry is sticky, so the figure is parked just below it rather than
 * centred: a centred figure is half-covered by the band and the still shows
 * the band across the map instead of the map.
 */
async function bringIntoView(page, selector) {
  const offset = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return 0;
    const rail = document.querySelector('.rail');
    const band = rail ? rail.getBoundingClientRect().height : 0;
    const top = el.getBoundingClientRect().top + window.scrollY - band - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    return band;
  }, selector);
  let last = -1;
  for (let i = 0; i < 40; i += 1) {
    const y = await page.evaluate(() => Math.round(window.scrollY));
    if (y === last) break;
    last = y;
    await new Promise((r) => setTimeout(r, 100));
  }
  return offset;
}

try {
  // The live figure on the site, at a desktop and a phone width.
  for (const [width, height, name] of [
    [1440, 1100, 'map-1440.png'],
    [390, 900, 'map-390.png'],
  ]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    await page.goto(`${server.origin}/zones/`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluateHandle('document.fonts.ready');
    await bringIntoView(page, '.map-figure');
    const figure = await page.$('.map-figure');
    await figure.screenshot({ path: resolve(shots, name) });
    await page.close();
  }

  // The figure hovered and the figure selected: the two states the reader
  // makes with the pointer.
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
    await page.goto(`${server.origin}/zones/`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluateHandle('document.fonts.ready');
    await bringIntoView(page, '.map-figure');

    const spot = await page.evaluate(() => {
      const el = [...document.querySelectorAll('[data-place]')].find(
        (e) => !e.classList.contains('is-clustered')
      );
      const r = el.getBoundingClientRect();
      return { id: el.getAttribute('data-place-id'), x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

    await page.mouse.move(spot.x - 60, spot.y - 60);
    await new Promise((r) => setTimeout(r, 120));
    await page.mouse.move(spot.x, spot.y);
    await new Promise((r) => setTimeout(r, 350));
    let figure = await page.$('.map-figure');
    await figure.screenshot({ path: resolve(shots, 'map-hover.png') });

    await page.mouse.click(spot.x, spot.y);
    await new Promise((r) => setTimeout(r, 350));
    figure = await page.$('.map-figure');
    await figure.screenshot({ path: resolve(shots, 'map-selected.png') });

    // The whole corpus: the two localities west of the corridor. The pointer
    // is moved off the sheet first, or the callout stays over the map while
    // the map moves under it.
    await page.mouse.move(20, 20);
    await new Promise((r) => setTimeout(r, 200));
    await page.click('[data-zoom="all"]');
    await new Promise((r) => setTimeout(r, 400));
    figure = await page.$('.map-figure');
    await figure.screenshot({ path: resolve(shots, 'map-all.png') });

    await page.close();
  }

  // The print twin, as the PDF sets it.
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.emulateMediaType('print');
    await page.goto(`${server.origin}/zones-print/`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise((r) => setTimeout(r, 600));
    const figure = await page.$('.map-figure');
    await figure.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await new Promise((r) => setTimeout(r, 400));
    await figure.screenshot({ path: resolve(shots, 'map-print.png') });
    await page.close();
  }

  console.log('captured the map stills');
} finally {
  await browser.close();
  await server.close();
}
