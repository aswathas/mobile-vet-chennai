// Close inspection of a citation cluster: the markup is correct, so the issue
// is in how the superscript is laid out next to the text that follows it.

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
  args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 3 });
  await page.goto(`${server.origin}/index.html`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise((r) => setTimeout(r, 400));

  const info = await page.evaluate(() => {
    // a citation that sits in running prose and is followed by a full stop
    let link = null;
    for (const a of document.querySelectorAll('a.cite')) {
      if (!a.closest('p')) continue;
      const n = a.nextSibling;
      if (n && n.nodeType === 3 && n.textContent.trim().startsWith('.')) {
        link = a;
        break;
      }
    }
    const p = link.closest('p');
    const r = link.getBoundingClientRect();

    const next = link.nextSibling;
    const range = document.createRange();
    range.selectNodeContents(next);
    const nr = range.getBoundingClientRect();
    const after = { text: next.textContent.slice(0, 40), rect: { top: nr.top, bottom: nr.bottom, left: nr.left } };

    // where the paragraph's own baseline sits
    const strut = document.createElement('span');
    strut.textContent = 'x';
    p.appendChild(strut);
    const sr = strut.getBoundingClientRect();
    strut.remove();

    const cs = getComputedStyle(link);
    return {
      linkText: link.textContent,
      linkRect: { top: r.top, bottom: r.bottom, left: r.left, right: r.right },
      linkStyle: {
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        verticalAlign: cs.verticalAlign,
        position: cs.position,
        top: cs.top,
        padding: cs.padding,
      },
      after,
      strutBaseline: sr.bottom,
      pFont: getComputedStyle(p).fontSize,
    };
  });

  console.log(JSON.stringify(info, null, 2));

  const clip = {
    x: Math.max(0, info.linkRect.left - 120),
    y: Math.max(0, info.linkRect.top - 16),
    width: 300,
    height: 46,
  };
  await page.screenshot({ path: resolve(root, '.shots', 'zoom-cite.png'), clip });
  console.log('shot     .shots/zoom-cite.png');
} finally {
  await browser.close();
  await server.close();
}
