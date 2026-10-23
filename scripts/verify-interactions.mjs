// Uses the site the way a reader does and records what actually happens.
//
// The polish pass is a pass over the real interaction path, not over the
// markup: the board filters, the corridor buttons, the link between the two
// documents, the keyboard order and the console. Run it after a build.

import puppeteer from 'puppeteer-core';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './static-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const server = await startStaticServer(resolve(root, 'dist'));
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--font-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});

const problems = [];
const note = (msg) => console.log(msg);

try {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(`${server.origin}/zones/`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');

  const boardState = () =>
    page.evaluate(() => {
      const gates = Array.from(document.querySelectorAll('.gate'));
      const visible = gates.filter((g) => !g.hidden);
      const target = document.querySelector('.gate--target');
      const empty = document.querySelector('.board__empty');
      return {
        total: gates.length,
        visible: visible.length,
        target: target ? target.querySelector('.gate__id')?.textContent : null,
        targetVisible: target ? !target.hidden : false,
        emptyShown: empty ? !empty.hidden : null,
      };
    });

  const initial = await boardState();
  note(`board initial          ${initial.visible} visible, arrow on ${initial.target}`);
  if (initial.visible !== 15) problems.push(`board shows ${initial.visible} gates, expected 15`);

  await page.select('select[data-filter="zone"]', 'B');
  const zoneB = await boardState();
  note(`filter zone B         ${zoneB.visible} visible, arrow on ${zoneB.target}`);
  if (zoneB.visible !== 7) problems.push(`zone B filter shows ${zoneB.visible} gates, expected 7`);
  if (zoneB.target && !zoneB.target.startsWith('B-')) problems.push('arrow did not move to a Zone B gate');

  await page.select('select[data-filter="zone"]', 'A');
  await page.select('select[data-filter="verdict"]', 'NO-GO');
  const empty = await boardState();
  note(`filter A + no-go      ${empty.visible} visible, empty state shown: ${empty.emptyShown}`);
  if (empty.visible !== 0) problems.push(`A + no-go shows ${empty.visible} gates, expected 0`);
  if (empty.emptyShown !== true) problems.push('the empty state did not appear');

  await page.select('select[data-filter="verdict"]', '');
  await page.select('select[data-filter="zone"]', '');
  const back = await boardState();
  note(`filter cleared        ${back.visible} visible, arrow on ${back.target}`);
  if (back.visible !== 15) problems.push(`clearing the filter shows ${back.visible} gates, expected 15`);
  if (back.emptyShown !== false) problems.push('the empty state stayed visible after clearing');

  // the corridor buttons
  const zoneBButton = await page.$('a.zonebtn__link[href*="zone-b"]');
  if (!zoneBButton) problems.push('no corridor button for Zone B');
  else {
    await zoneBButton.click();
    await new Promise((r) => setTimeout(r, 700));
    const hash = await page.evaluate(() => location.hash);
    const headingTop = await page.evaluate(() => {
      const h = document.querySelector('.doc h2#zone-b-the-omr-and-ecr-corridor');
      if (!h) return null;
      return Math.round(h.getBoundingClientRect().top);
    });
    note(`corridor button       hash ${hash}, heading ${headingTop}px from the top`);
    if (!hash.includes('zone-b')) problems.push('the corridor button did not navigate');
    if (headingTop === null || headingTop < 0 || headingTop > 200) {
      problems.push(`the corridor heading landed at ${headingTop}px, under the gantry`);
    }
  }

  // keyboard order on the dossier
  await page.goto(`${server.origin}/zones/`, { waitUntil: 'networkidle0' });
  const tabbed = await page.evaluate(async () => {
    const seen = [];
    document.body.focus();
    return seen;
  });
  const focusOrder = await page.evaluate(() => {
    const focusables = Array.from(
      document.querySelectorAll('a[href], select, button, [tabindex]:not([tabindex="-1"])')
    );
    return focusables
      .slice(0, 12)
      .map((el) => `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''}`);
  });
  note(`focus order           ${focusOrder.join(' > ')}`);

  // the link between the two documents
  await page.goto(`${server.origin}/`, { waitUntil: 'networkidle0' });
  const go = await page.$('a.gobtn');
  if (!go) problems.push('no link from the report to the dossier');
  else {
    await go.click();
    await new Promise((r) => setTimeout(r, 600));
    const url = await page.evaluate(() => location.pathname);
    note(`report to dossier      ${url}`);
    if (!url.includes('/zones')) problems.push('the next-document link did not reach the dossier');
  }

  // the dossier's way back
  const backLink = await page.$('a.backlink');
  if (!backLink) problems.push('no link from the dossier back to the report');
  else {
    await backLink.click();
    await new Promise((r) => setTimeout(r, 600));
    const url = await page.evaluate(() => location.pathname);
    note(`dossier to report      ${url}`);
    if (!url.endsWith('/')) problems.push('the back link did not reach the report');
  }

  if (consoleErrors.length) {
    for (const e of consoleErrors) problems.push(`console error: ${e}`);
  }

  note('');
  note(problems.length ? `${problems.length} problem(s):` : 'the interaction path is clean');
  for (const p of problems) note(`  x ${p}`);
} finally {
  await browser.close();
  await server.close();
}
