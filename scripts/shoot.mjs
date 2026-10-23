// One bounded inspection round: desktop and mobile, top of page, a dense table
// section and the trims. Everything is captured in a single pass so the fixes
// can be made in one batch rather than a screenshot loop.

import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './static-server.mjs';
import { stitch } from './stitch.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const shots = resolve(root, '.shots');
const review = resolve(root, '.impeccable', 'review');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

await mkdir(shots, { recursive: true });

// The Astro bundle is referenced with an absolute path, so the build has to be
// inspected over HTTP. Under file:// that path resolves to the filesystem root
// and the stylesheet silently 404s.
const server = await startStaticServer(resolve(root, 'dist'));
const URL = `${server.origin}/index.html`;

await mkdir(review, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});

const problems = [];

const PROBE = () => {
  const out = {};
  const doc = document.querySelector('.doc');

  // --- measure, in pixels, in ch, and in characters per line ---------------
  const p = Array.from(doc.querySelectorAll('p')).find((el) => !el.closest('.verdict'));
  const cs = getComputedStyle(p);
  const probe = document.createElement('span');
  probe.style.cssText =
    'position:absolute;visibility:hidden;white-space:pre;font:inherit;letter-spacing:inherit;';
  probe.textContent = '0'.repeat(50);
  p.appendChild(probe);
  const chPx = probe.getBoundingClientRect().width / 50;
  probe.remove();

  const paras = Array.from(doc.querySelectorAll(':scope > p')).filter(
    (el) => el.textContent.trim().length > 140
  );
  const cpl = paras.slice(0, 40).map((el) => {
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    const lines = Math.max(1, Math.round(el.getBoundingClientRect().height / lh));
    return el.textContent.trim().length / lines;
  });

  out.measurePx = Math.round(p.getBoundingClientRect().width);
  out.measureCh = +(p.getBoundingClientRect().width / chPx).toFixed(1);
  out.chPx = +chPx.toFixed(2);
  out.cpl = cpl.length ? Math.round(cpl.reduce((a, b) => a + b, 0) / cpl.length) : null;
  out.bodyFont = cs.fontFamily;
  out.bodyPx = cs.fontSize;

  // --- content ------------------------------------------------------------
  out.headings = document.querySelectorAll('h2[id],h3[id]').length;
  out.cites = document.querySelectorAll('a.cite').length;
  out.tables = document.querySelectorAll('.doc table').length;
  out.railFrames = document.querySelectorAll('.frame').length;
  out.activeFrame = document.querySelector('.frame[aria-current="true"]')?.textContent.trim() ?? null;
  out.verdict = document.querySelector('.verdict p')?.textContent.trim().slice(0, 90) ?? null;
  out.ledeEmpty = !out.verdict;

  // --- table widths against the reading column -----------------------------
  const docBox = doc.getBoundingClientRect();
  const widest = Array.from(doc.querySelectorAll('table'))
    .map((t) => Math.round(t.getBoundingClientRect().width))
    .sort((a, b) => b - a)[0];
  out.tableWidest = widest ?? null;
  out.tableOverflow = widest ? Math.round(widest - docBox.width) : null;

  // where the deciding number sits, and how tall the band above it is
  const num = document.querySelector('.result__num');
  out.keyResultTop = num ? Math.round(num.getBoundingClientRect().top) : null;
  out.bandH = Math.round(
    (document.querySelector('.band')?.getBoundingClientRect().height ?? 0)
  );
  out.railH = Math.round(
    (document.querySelector('.rail')?.getBoundingClientRect().height ?? 0)
  );

  // --- horizontal overflow, ignoring anything inside a scroll container -----
  const vw = document.documentElement.clientWidth;
  out.clientW = vw;
  out.docScrollW = document.documentElement.scrollWidth;
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true;
    }
    return false;
  };
  out.overflowing = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (getComputedStyle(el).position === 'fixed') continue;
    if (r.right <= vw + 1 && r.left >= -1) continue;
    if (clipped(el)) continue;
    out.overflowing.push(
      `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} l=${Math.round(r.left)} r=${Math.round(r.right)} w=${Math.round(r.width)}`
    );
  }
  out.overflowing = out.overflowing.slice(0, 12);
  return out;
};

try {
  const page = await browser.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
  page.on('requestfailed', (r) =>
    problems.push(`[404] ${r.url().replace(server.origin, '')}`)
  );

  const settle = (ms) => new Promise((r) => setTimeout(r, ms));
  const shoot = async (name) => {
    await page.screenshot({ path: resolve(shots, `${name}.png`) });
    await page.screenshot({ path: resolve(review, `${name}.png`) });
  };
  const jump = async (id) => {
    await page.evaluate((sel) => {
      const el = document.getElementById(sel);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, id);
    await settle(400);
  };

  // The whole document in one image. Chrome's compositor caps a surface at
  // 16384px, so anything taller is re-rendered from scroll zero and the top of
  // the page appears twice. The document is captured in segments and joined
  // pixel by pixel instead.
  const SEGMENT = 10000;
  const fullPage = async (name, width) => {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const segs = [];
    for (let y = 0; y < height; y += SEGMENT) {
      const h = Math.min(SEGMENT, height - y);
      await page.setViewport({ width, height: h, deviceScaleFactor: 1 });
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await settle(500);
      const file = resolve(shots, `seg-${name}-${segs.length}.png`);
      await page.screenshot({ path: file });
      segs.push(file);
    }
    const out = await stitch(segs, resolve(review, name));
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await settle(300);
    return out;
  };

  // the rail is sticky; in a full-page image it must appear once, in flow
  const freezeRail = () =>
    page.addStyleTag({ content: '.rail { position: static !important; }' });
  const thawRail = async () => {
    await page.evaluate(() => {
      for (const el of document.querySelectorAll('style')) {
        if (el.textContent.includes('position: static !important')) el.remove();
      }
    });
  };

  // ---- desktop --------------------------------------------------------
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');
  await settle(500);
  await shoot('desktop-top');

  await page.evaluate(() => {
    document.querySelector('.result')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await settle(400);
  await shoot('desktop-result');

  const desktop = await page.evaluate(PROBE);

  // full page, from the document top, for the finish review
  await freezeRail();
  const desktopHeight = await fullPage('desktop.png', 1440);
  await thawRail();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await settle(400);

  await jump('route-density-and-unit-economics');
  await shoot('desktop-section');
  const atTable = await page.evaluate(PROBE);

  // an actual table, not the prose above it
  await page.evaluate(() => {
    const t = document.querySelectorAll('.doc table')[1] ?? document.querySelector('.doc table');
    t?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await settle(500);
  await shoot('desktop-table');

  await jump('references');
  await shoot('desktop-trims');
  const atTrims = await page.evaluate(PROBE);

  // ---- mobile ---------------------------------------------------------
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');
  await settle(500);
  await shoot('mobile-top');
  const mobile = await page.evaluate(PROBE);

  await freezeRail();
  const mobileHeight = await fullPage('mobile.png', 390);
  await thawRail();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await settle(400);

  await page.evaluate(() => {
    const t = document.querySelectorAll('.doc table')[1] ?? document.querySelector('.doc table');
    t?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await settle(500);
  await shoot('mobile-table');

  console.log('desktop  ' + JSON.stringify(desktop));
  console.log('atTable  ' + JSON.stringify(atTable));
  console.log('atTrims  ' + JSON.stringify(atTrims));
  console.log('mobile   ' + JSON.stringify(mobile));
  console.log(`heights  desktop ${desktopHeight}px, mobile ${mobileHeight}px`);
  console.log('issues   ' + (problems.length ? problems.slice(0, 12).join(' | ') : 'none'));
} finally {
  await browser.close();
  await server.close();
}
