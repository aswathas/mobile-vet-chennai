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

  // the Locality Map figure interactions
  const figure = await page.$('[data-figure]');
  if (!figure) {
    problems.push('the Locality Map figure is not on the page');
  } else {
    // A place that is not swallowed by a cluster at this zoom. The clustered
    // ones are hidden on purpose: the reader reaches them by zooming in.
    const visibleId = await page.evaluate(() => {
      const open = [...document.querySelectorAll('[data-place]')].find(
        (el) => !el.classList.contains('is-clustered')
      );
      return open?.getAttribute('data-place-id') ?? null;
    });
    if (!visibleId) problems.push('no place is visible on the map at the opening frame');
    else {
      // 1. Press a place: it lifts, and the readout reads it out.
      await page.evaluate((id) => {
        const el = document.querySelector(`[data-place][data-place-id="${id}"]`);
        el?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      }, visibleId);
      await new Promise((r) => setTimeout(r, 120));
      const isSel = await page.evaluate(
        (id) => document.querySelector(`[data-place][data-place-id="${id}"]`)?.classList.contains('is-selected'),
        visibleId
      );
      const name = await page.evaluate(() => document.querySelector('[data-readout] [data-readout-field="name"]')?.textContent);
      const cases = await page.evaluate(() => document.querySelector('[data-readout] [data-readout-field="cases"]')?.textContent);
      note(`figure place press    ${visibleId} selected: ${isSel}, readout: "${name}", "${cases}"`);
      if (!isSel) problems.push(`pressing ${visibleId} did not mark it as selected`);
      if (!name) problems.push(`pressing ${visibleId} raised no name in the readout`);
      if (!cases) problems.push(`pressing ${visibleId} raised no cases in the readout`);
    }

    // 2. The sliders filter the map and the count follows them.
    const before = await page.evaluate(() => document.querySelector('[data-map-count]')?.textContent);
    const sliderWorked = await page.evaluate(() => {
      const slider = document.querySelector('[data-slider="cases"]');
      if (!slider) return false;
      slider.value = String(Math.round(Number(slider.max) * 0.6));
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    });
    await new Promise((r) => setTimeout(r, 120));
    const after = await page.evaluate(() => document.querySelector('[data-map-count]')?.textContent);
    note(`figure slider         count "${before}" -> "${after}"`);
    if (!sliderWorked) problems.push('the map has no cases slider');
    if (before === after) problems.push('moving the cases slider did not change the count');
    await page.evaluate(() => {
      for (const slider of document.querySelectorAll('[data-slider]')) {
        slider.value = slider.dataset.slider === 'saturation' ? slider.max : slider.min;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await new Promise((r) => setTimeout(r, 120));

    // 3. Filter from the decision board
    await page.select('select[data-filter="zone"]', 'B');
    await new Promise((r) => setTimeout(r, 100));
    const filterDimA = await page.evaluate(() => {
      const stopsA = Array.from(document.querySelectorAll('[data-place][data-zone="A"]'));
      return stopsA.every((s) => s.hasAttribute('data-dimmed'));
    });
    const filterLitB = await page.evaluate(() => {
      const stopsB = Array.from(document.querySelectorAll('[data-place][data-zone="B"]'));
      return stopsB.every((s) => !s.hasAttribute('data-dimmed'));
    });
    note(`figure board filter    Zone A dimmed: ${filterDimA}, Zone B lit: ${filterLitB}`);
    if (!filterDimA) problems.push('Zone A places were not dimmed under Zone B filter');
    if (!filterLitB) problems.push('Zone B places were dimmed under Zone B filter');
    await page.select('select[data-filter="zone"]', '');
    await new Promise((r) => setTimeout(r, 100));

    // 4. Keyboard navigation along route
    const walkFrom = await page.evaluate(() => {
      const open = [...document.querySelectorAll('[data-place]')].find(
        (el) => !el.classList.contains('is-clustered') && el.getAttribute('data-cluster')
      );
      if (!open) return null;
      open.focus();
      return {
        id: open.getAttribute('data-place-id'),
        cluster: open.getAttribute('data-cluster'),
      };
    });
    if (!walkFrom) problems.push('no place is focusable on the map');
    else {
      await page.keyboard.press('ArrowRight');
      await new Promise((r) => setTimeout(r, 80));
      const activeId = await page.evaluate(() => document.activeElement?.getAttribute('data-place-id'));
      const activeCluster = await page.evaluate(() => document.activeElement?.getAttribute('data-cluster'));
      note(`figure keyboard        focused ${walkFrom.id} -> ArrowRight focused ${activeId}`);
      if (!activeId) problems.push(`ArrowRight on ${walkFrom.id} moved focus nowhere`);
      else if (activeCluster !== walkFrom.cluster) {
        problems.push(`ArrowRight moved from ${walkFrom.id} to ${activeId}, which is on route ${activeCluster}, not ${walkFrom.cluster}`);
      }
    }

    // 5. Follow a deep link
    await page.goto(`${server.origin}/zones/?place=A05`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 100));
    const deepSel = await page.evaluate(() => document.querySelector('[data-place][data-place-id="A05"]')?.classList.contains('is-selected'));
    const deepName = await page.evaluate(() => document.querySelector('[data-readout] [data-readout-field="name"]')?.textContent);
    const deepUrl = await page.evaluate(() => location.search);
    note(`figure deep link       ?place=A05 selected: ${deepSel}, readout: "${deepName}"`);
    if (!deepSel) problems.push('?place=A05 did not select A05 on load');
    if (!deepName || !deepName.includes('Kadaperi')) problems.push(`deep link readout for A05 reads "${deepName}", expected Kadaperi`);
    if (!deepUrl.includes('place=A05')) problems.push('the deep link did not hold the place in the URL');
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
