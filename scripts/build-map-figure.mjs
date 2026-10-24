// Builds the Locality Map.
//
// The map is drawn, not committed: this script reads the two research passes
// and the OSM geometry, binds the hundred localities into the fields the map
// draws, and writes the markup, the styles and the client layer into
// src/content/zones, which the dossier page imports.
//
// Run: node scripts/build-map-figure.mjs
//      node scripts/build-map-figure.mjs --audit   (also audits the projection)

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { selfCheck } from '../src/map/projection.mjs';
import { bindCorpus } from '../src/map/corpus.mjs';
import { buildMap } from '../src/map/map.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'src', 'content', 'zones');
const DIST = join(root, 'dist-figure');

const money = (value) => Number(value).toLocaleString('en-IN');

async function readJson(path, label) {
  try {
    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`build-map-figure: failed to read ${label} at ${path}: ${err.message}`);
  }
}

const escape = (text) =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Joins the client layer and the label layout into one script the page can
 * carry inline. The layout is a module in the source so it can be read and
 * checked on its own; here its body goes inside the client's closure and its
 * import is dropped.
 */
function bundleClient(labels, client) {
  // Only the module's own statements are touched: an import line at the head
  // of a file, and an export in front of a declaration. Nothing else.
  const body = labels
    .split('\n')
    .map((line) => line.replace(/^(\s*)export\s+(?=(const|let|var|function|class)\b)/, '$1'))
    .filter((line) => !/^\s*import\s+[\s\S]*from\s+['"][^'"]+['"];?\s*$/.test(line))
    .join('\n');

  const withoutImport = client
    .split('\n')
    .filter((line) => !/^\s*import\s+[\s\S]*from\s+['"][^'"]+['"];?\s*$/.test(line))
    .join('\n');

  // The client opens with an IIFE. The layout is placed inside it, so the
  // layout's names are the client's names and nothing leaks onto the page.
  const open = withoutImport.indexOf('(function () {');
  if (open === -1) throw new Error('build-map-figure: the client layer does not open its closure');
  const head = withoutImport.slice(0, open);
  const rest = withoutImport.slice(open + '(function () {'.length);

  return `${head}(function () {\n${body}\n${rest}`;
}

/**
 * The four sliders, drawn from the corpus's own numbers so a slider can never
 * reach past the data. Every one of them travels across the range the data
 * actually occupies: a slider whose bottom half sits below the smallest value
 * in the corpus is dead travel, and a reader who drags it learns nothing.
 *
 * Three of the four count up from a floor ("at least Rs 1,295"). Saturation
 * counts down, because a busier market is the one being filtered out.
 */
function slidersHtml(ranges) {
  const specs = [
    {
      key: 'cases',
      label: 'Cases a month',
      min: ranges.cases.min,
      max: ranges.cases.max,
      step: 5,
      unit: '',
      suffix: '+',
      direction: 'at least',
    },
    {
      key: 'price',
      label: 'Our blended price',
      min: ranges.price.min,
      max: ranges.price.max,
      step: 5,
      unit: 'Rs ',
      suffix: '+',
      direction: 'at least',
    },
    {
      key: 'margin',
      label: 'Margin a visit',
      min: ranges.margin.min,
      max: ranges.margin.max,
      step: 5,
      unit: 'Rs ',
      suffix: '+',
      direction: 'at least',
    },
    {
      key: 'saturation',
      label: 'Saturation index',
      min: ranges.saturation.min,
      max: ranges.saturation.max,
      step: 1,
      unit: '',
      suffix: '',
      direction: 'under',
    },
  ];
  return specs
    .map((spec) => {
      const value = spec.direction === 'under' ? spec.max : spec.min;
      const shown =
        spec.direction === 'under'
          ? `under ${value}`
          : `${spec.unit}${money(value)}${spec.suffix}`;
      return (
        `<label class="map-slider" data-slider-label="${spec.key}">` +
        `<span class="map-slider__label">${escape(spec.label)}</span>` +
        `<span class="map-slider__value" data-slider-value="${spec.key}">${shown}</span>` +
        `<input type="range" data-slider="${spec.key}" min="${spec.min}" max="${spec.max}" step="${spec.step}" value="${value}" ` +
        `aria-label="${escape(spec.label)}: ${spec.direction} ${spec.direction === 'under' ? spec.max : spec.min}">` +
        `</label>`
      );
    })
    .join('');
}

/**
 * The readout panel. Every field is filled by the client from the mark's own
 * data, and the print twin fills the same panel from the corpus.
 */
function readoutHtml(place) {
  return (
    `<aside class="map-readout" data-readout data-verdict="${place.verdict}">` +
    `<p class="map-readout__eyebrow" data-readout-field="id">${escape(place.id)}</p>` +
    `<h3 class="map-readout__name" data-readout-field="name">${escape(place.name)}</h3>` +
    `<p class="map-readout__where" data-readout-field="ward">${escape(place.ward)}</p>` +
    `<dl class="map-readout__numbers">` +
    `<div><dt>Cases a month</dt><dd data-readout-field="cases">${Math.round(place.cases)} a month</dd></div>` +
    `<div><dt>Our blend</dt><dd data-readout-field="price">Rs ${money(place.price)}</dd></div>` +
    `<div><dt>Margin</dt><dd data-readout-field="margin">Rs ${money(place.margin)}</dd></div>` +
    `<div><dt>Saturation</dt><dd data-readout-field="saturation">${place.saturation} / 100</dd></div>` +
    `<div><dt>To hub</dt><dd data-readout-field="travel">${place.travelMin} min</dd></div>` +
    `<div><dt>Verdict</dt><dd data-readout-field="verdict">${escape(place.verdict)}</dd></div>` +
    `</dl>` +
    `<p class="map-readout__reason" data-readout-field="reason">${escape(place.verdictReason)}</p>` +
    `</aside>`
  );
}

/**
 * The legend. The last key explains what a count on a cluster means, and how
 * to read it differs on paper from on a screen: on a screen the reader zooms
 * to separate the places, on paper there is nothing to zoom.
 */
function legendHtml(interactive) {
  return (
    `<ul class="map-legend">` +
    `<li><span class="map-legend__mark map-legend__mark--go"></span>GO — ${'a stop worth a round'}</li>` +
    `<li><span class="map-legend__mark map-legend__mark--hold"></span>HOLD — one test fails</li>` +
    `<li><span class="map-legend__mark map-legend__mark--nogo"></span>NO-GO — not worth a stop</li>` +
    `<li><span class="map-legend__mark map-legend__mark--route"></span>the fifteen routes in travel order</li>` +
    `<li>${
      interactive
        ? 'a count means the places are there: zoom in to separate them'
        : 'a count is the number of places at that point; the appendix names them'
    }</li>` +
    `</ul>`
  );
}

/**
 * The caption, written from the corpus so that every count in it is the count
 * the data holds.
 */
function captionHtml(corpus) {
  const { counts } = corpus;
  const band = corpus.bandIds.size;
  const remote = corpus.remoteIds.size;

  const WORDS = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen',
  ];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const numberWord = (n) => {
    if (n < 20) return WORDS[n];
    if (n < 100) {
      const t = TENS[Math.floor(n / 10)];
      const o = n % 10;
      // A non-breaking hyphen: a number that breaks across two lines reads as
      // two numbers.
      return o ? `${t}‑${WORDS[o]}` : t;
    }
    if (n === 100) return 'a hundred';
    return String(n);
  };

  return (
    `<p class="map-caption">A hundred localities at their true coordinates, coloured by the dossier's own verdict rule: ` +
    `${numberWord(counts.go)} GO, ${numberWord(counts.hold)} HOLD, ${numberWord(counts.noGo)} NO-GO. The fifteen routes ` +
    `are drawn in travel order, and the four spines are named roads. The frame opens on the coastal corridor, where ` +
    `${numberWord(band)} of the hundred places sit; ${numberWord(remote)} ${remote === 1 ? 'lies' : 'lie'} far to the ` +
    `west, out of the corridor, and ${remote === 1 ? 'is' : 'are'} reached with <em>all</em>. Positions are placed from ` +
    `coordinates with a cos(lat) correction at 13°N and are not a survey; the coastline and the road spines are ` +
    `OpenStreetMap at the corpus's own resolution. Zone A's household base is modelled (tier C) while Zone B's is ` +
    `derived (tier B).</p>`
  );
}

function figureHtml({ svg, place, interactive, corpus }) {
  // The print twin has no pointer, so it cannot say "hover a place". It says
  // what the sheet is, and it says what the sheet does not carry.
  const hint = interactive
    ? 'Hover a place to lift it &middot; click to keep it &middot; drag to pan &middot; scroll to zoom'
    : 'Every mark at its true coordinate &middot; the two localities west of the corridor are off this sheet';

  const head =
    `<div class="map-head">` +
    `<span class="map-head__fig">Fig 4</span>` +
    `<span class="map-head__title">The Locality Map</span>` +
    `<span class="map-head__hint">${hint}</span>` +
    `</div>`;

  const toolbar = interactive
    ? `<div class="map-toolbar"><div class="map-toolbar__sliders">${slidersHtml(corpus.ranges)}</div>` +
      `<p class="map-toolbar__count" data-map-count>${corpus.counts.places} of ${corpus.counts.places} places match</p></div>`
    : '';

  const callout = interactive ? `<div class="map-callout" data-map-callout hidden></div>` : '';

  const zoom = interactive
    ? `<div class="map-zoom">` +
      `<button type="button" data-zoom="in" aria-label="Zoom in">+</button>` +
      `<button type="button" data-zoom="out" aria-label="Zoom out">&minus;</button>` +
      `<button type="button" data-zoom="fit" aria-label="Fit the coastal corridor">fit</button>` +
      `<button type="button" data-zoom="all" aria-label="Show all hundred localities">all</button>` +
      `</div>`
    : '';

  const furniture =
    `<div class="map-scale" data-map-scale aria-hidden="true">` +
    `<span class="map-scale__bar" data-map-scale-bar></span>` +
    `<span class="map-scale__label" data-map-scale-label>1 km</span>` +
    `</div>` +
    `<div class="map-north" aria-hidden="true">` +
    `<svg viewBox="0 0 24 34" width="24" height="34"><path d="M12 2 L12 26 M12 2 L7 11 M12 2 L17 11" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="12" y="33" text-anchor="middle" font-size="11" fill="currentColor">N</text></svg>` +
    `</div>`;

  return (
    `<figure class="map-figure" id="${interactive ? 'locality-map' : 'locality-map-print'}" data-figure>` +
    head +
    toolbar +
    `<div class="map-body">` +
    `<div class="map-stage" data-map-stage>` +
    `<div class="map-canvas" data-map-canvas>${svg}${callout}</div>` +
    zoom +
    furniture +
    `</div>` +
    readoutHtml(place) +
    `</div>` +
    legendHtml(interactive) +
    captionHtml(corpus) +
    `</figure>`
  );
}

/**
 * A standalone page, for inspection and for the screenshot passes. The site
 * itself imports the fragment.
 */
function standalonePage({ title, body, css, js }) {
  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>${escape(title)}</title>` +
    `<style>body{margin:0;padding:28px;background:#fff;}` +
    `.map-figure{max-width:1200px;margin:0 auto;}` +
    `${css}</style></head><body>${body}` +
    (js ? `<script>${js}</script>` : '') +
    `</body></html>`
  );
}

async function main() {
  console.log('1. Checking the projection self-check...');
  selfCheck();
  console.log('   Projection self-check passed.');

  console.log('2. Loading the research datasets...');
  const zoneA = await readJson(join(root, 'research', 'zone-a', 'localities.json'), 'Zone A');
  const zoneB = await readJson(join(root, 'research', 'zone-b', 'localities.json'), 'Zone B');
  const osmGeo = await readJson(join(root, 'research', 'map-geometry', 'osm-coast-and-spines.json'), 'OSM Geo');
  const corpus = bindCorpus(zoneA, zoneB);
  console.log(
    `   ${corpus.counts.places} localities, ${corpus.counts.routes} routes, ${corpus.counts.go} GO, ${corpus.counts.hold} HOLD, ${corpus.counts.noGo} NO-GO.`
  );

  console.log('3. Drawing the map...');
  // The nominal width is the width the sheet is drawn at: the client measures
  // the real one and corrects, but the print twin has no client and needs the
  // marks at the right size on the page.
  const map = buildMap({ corpus, osmGeo, view: 'full', width: 864 });
  const printed = buildMap({ corpus, osmGeo, view: 'band', width: 514 });

  // The place the readout opens on: the corpus's best our-mix revenue.
  const defaultPlace = [...corpus.places].sort((a, b) => b.revenue - a.revenue)[0];
  console.log(`   Default readout: ${defaultPlace.id} ${defaultPlace.name}.`);

  console.log('4. Writing the figure...');
  await mkdir(OUT, { recursive: true });
  await mkdir(DIST, { recursive: true });

  const css = await readFile(join(root, 'src', 'map', 'figure.css'), 'utf8');
  // The client layer and the label layout are two files, because the layout
  // is a rule worth reading on its own. The page carries them as one inline
  // script, so they are joined here: the layout's body goes inside the
  // client's closure, and the import goes away.
  const labels = await readFile(join(root, 'src', 'map', 'labels.mjs'), 'utf8');
  const client = await readFile(join(root, 'src', 'map', 'client.js'), 'utf8');
  const js = bundleClient(labels, client);

  const body = figureHtml({ svg: map.svg, place: defaultPlace, interactive: true, corpus });
  const printBody = figureHtml({ svg: printed.svg, place: defaultPlace, interactive: false, corpus });

  await writeFile(join(OUT, 'figure.html'), body, 'utf8');
  await writeFile(join(OUT, 'figure-print.html'), printBody, 'utf8');
  await writeFile(join(OUT, 'figure.css'), css, 'utf8');
  await writeFile(join(OUT, 'figure.js'), js, 'utf8');

  await writeFile(
    join(DIST, 'locality-map.html'),
    standalonePage({ title: 'The Locality Map', body, css, js }),
    'utf8'
  );
  await writeFile(
    join(DIST, 'locality-map-print.html'),
    standalonePage({ title: 'The Locality Map — print', body: printBody, css, js }),
    'utf8'
  );
  console.log('   Wrote src/content/zones/figure.html, figure-print.html, figure.css, figure.js');
  console.log('   Wrote dist-figure/locality-map.html and locality-map-print.html');
  console.log('build-map-figure: complete.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
