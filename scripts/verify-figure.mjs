// Proves the Corridor Bench behaves.
//
// The figure is a claim about the corpus: a hundred places, each carrying its
// own numbers, a price token that re-reads the routes, a board that filters
// the plate, a keyboard that reaches it and a link that shares it. This drives
// the built page the way a reader does and checks every number it finds
// against the research corpus, never against a count the page writes about
// itself.
//
// Run: npm run build && node scripts/verify-figure.mjs

import puppeteer from 'puppeteer-core';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { startStaticServer } from './static-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const RESEARCH = process.env.MVT_RESEARCH ?? 'research';

// --- The DOM contract --------------------------------------------------------
// Everything the figure has to expose, in one place, so the whole set can be
// corrected in one edit when the markup lands.
const DOM = {
  figure: '[data-figure]',            // the plate: one element, the figure's root
  place: '[data-place]',              // one pressable stop on the plate
  placeId: 'data-place-id',           // the locality id the stop carries
  zone: 'data-zone',                  // 'A' or 'B'
  cluster: 'data-cluster',            // the route cluster id, e.g. 'A-R7'
  verdict: 'data-verdict',            // 'GO' | 'HOLD' | 'NO-GO'
  dimmed: 'data-dimmed',              // present when the board filtered the stop out
  token: '[data-token]',              // the price token on its rail
  tokenValue: 'data-token-value',     // the token's price in rupees
  route: '[data-route-contribution]', // one engraved plate per route
  readout: '[data-readout]',          // the platen that slides out
  readoutField: 'data-readout-field', // names the number a readout field carries
  placeX: 'data-place-x',             // the placement the page used, world units
  placeY: 'data-place-y',
  selected: [                         // how a selected stop might be marked
    '[aria-pressed="true"]',
    '[aria-selected="true"]',
    '[data-selected]',
    '.is-selected',
    '.is-active',
    '[data-state="selected"]',
    '[data-state="active"]',
  ],
};

// The board is the site's own instrument; the figure only has to answer it.
const BOARD = {
  zone: 'select[data-filter="zone"]',
  verdict: 'select[data-filter="verdict"]',
  empty: '.board__empty',
};

// The platen names its own fields.
const FIELDS = {
  name: 'name',
  cases: 'cases',
  price: 'price',
  margin: 'margin',
  saturation: 'saturation',
  verdict: 'verdict',
};

// Tolerances, and why each is what it is.
const TOL = {
  geometry: 0.5,       // world units: the projection is exact, this covers rounding
  cases: 0.5,          // visits: the corpus carries a decimal, the plate rounds
  rupees: 1,           // rupees: whole in the corpus, whole on the plate
  contribution: 0.001, // of the value: the corpus rounds contributions to whole rupees
};

const CHECKS = ['places', 'geometry', 'render', 'readout', 'token', 'filter', 'keyboard', 'deep link', 'console', 'mobile'];

const readJson = async (p) => JSON.parse(await readFile(p, 'utf8'));
const zoneA = await readJson(join(root, RESEARCH, 'zone-a', 'localities.json'));
const zoneB = await readJson(join(root, RESEARCH, 'zone-b', 'localities.json'));
const corpus = [...zoneA.localities, ...zoneB.localities];
const byId = new Map(corpus.map((l) => [l.id, l]));

// The corpus's own route model, rebuilt here so the figure is checked against
// the data and not against a number written into the page: one route carries
// ROUTE_CAPACITY visits a month, and a route's contribution is its cases at
// the price less the Rs 850 clustered cost of each visit.
const ROUTE_CAPACITY = Math.max(
  ...corpus.map((l) => l.economics.serviceable_ceiling.one_route.cases_per_month)
);
const CLUSTER_COST = corpus[0].economics.cost_per_visit_clustered;

const clusters = new Map();
for (const l of corpus) {
  const c = clusters.get(l.route_cluster) ?? { id: l.route_cluster, zone: l.zone, cases: 0, revenue: 0 };
  c.cases += l.demand.cases_per_month_total;
  c.revenue += l.economics.our_mix.monthly_revenue_potential;
  clusters.set(l.route_cluster, c);
}
for (const c of clusters.values()) {
  c.routeCases = Math.min(ROUTE_CAPACITY, Math.round(c.cases));
  c.blend = c.revenue / c.cases;
}

// The places the geometry check looks at: a spread across both corridors,
// plus the two hubs, found from the corpus rather than named here.
const hubId = (zone) =>
  zone.localities.find(
    (l) => Math.abs(l.lat - zone.hub.lat) < 1e-9 && Math.abs(l.lon - zone.hub.lon) < 1e-9
  )?.id;
const SAMPLE = [];
for (const list of [zoneA.localities, zoneB.localities]) {
  for (const i of [0, Math.floor(list.length / 4), Math.floor(list.length / 2), Math.floor((3 * list.length) / 4), list.length - 1]) {
    SAMPLE.push(list[i].id);
  }
}
SAMPLE.push(hubId(zoneA), hubId(zoneB));

const note = (msg) => console.log(msg);
const results = [];
const record = (name, status, reason) => {
  results.push({ name, status, reason });
  note(`${name.padEnd(12)} ${status.padEnd(5)} ${reason}`);
};

const firstNumber = (text) => {
  const m = String(text ?? '')
    .replace(/,/g, '')
    .match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
};
const squash = (s) => String(s ?? '').toUpperCase().replace(/[^A-Z]/g, '');
const settle = (ms = 160) => new Promise((r) => setTimeout(r, ms));

// The name a plate is allowed to carry: the corpus name, its head before the
// parenthesis, or any alias the corpus publishes.
const nameMatches = (shown, l) => {
  const t = String(shown ?? '').toLowerCase();
  const candidates = [l.name, l.name.split(' (')[0], ...(l.aliases || [])]
    .filter(Boolean)
    .map((s) => s.toLowerCase());
  return candidates.some((c) => t.includes(c));
};

// Where an element is, in viewport pixels. The page's own rect is used
// because a browser's box model for an SVG group is not reliable.
function rectOf(handle) {
  return handle.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
}

// --- The checks --------------------------------------------------------------

// 1. Every place is present, once, carrying its own record.
async function checkPlaces(ctx) {
  const places = await ctx.readPlaces();
  const problems = [];
  const seen = new Map();
  for (const p of places) seen.set(p.id, (seen.get(p.id) ?? 0) + 1);

  if (places.length !== corpus.length) {
    problems.push(`the plate carries ${places.length} stops, the corpus has ${corpus.length}`);
  }
  for (const l of corpus) {
    const n = seen.get(l.id) ?? 0;
    if (n === 0) {
      problems.push(`${l.id} ${l.name} is missing from the plate`);
      continue;
    }
    if (n > 1) problems.push(`${l.id} appears ${n} times on the plate`);
    const p = places.find((x) => x.id === l.id);
    if (p.zone !== l.zone) problems.push(`${l.id} carries zone "${p.zone}", the corpus says ${l.zone}`);
    if (p.cluster !== l.route_cluster) problems.push(`${l.id} carries cluster "${p.cluster}", the corpus says ${l.route_cluster}`);
    if (squash(p.verdict) !== squash(l.verdict.status)) problems.push(`${l.id} carries verdict "${p.verdict}", the corpus says ${l.verdict.status}`);
  }
  for (const p of places.filter((x) => !byId.has(x.id))) {
    problems.push(`the plate carries "${p.id}", which is not in the corpus`);
  }

  return problems.length
    ? { status: 'FAIL', reason: problems.slice(0, 4).join('; ') + (problems.length > 4 ? `; and ${problems.length - 4} more` : '') }
    : { status: 'PASS', reason: `${places.length} stops, each with the corpus id, zone, cluster and verdict` };
}

// 2. Geometry is honest: the plate's own placement is the projection.
async function checkGeometry(ctx) {
  let projection = null;
  try {
    projection = await import(pathToFileURL(join(root, 'src', 'iso', 'projection.mjs')).href);
  } catch {
    projection = null;
  }
  if (!projection?.place) {
    return { status: 'SKIP', reason: 'src/iso/projection.mjs could not be read, so there is no projection to check against' };
  }

  const places = await ctx.readPlaces();
  const sampled = SAMPLE.map((id) => places.find((p) => p.id === id)).filter(Boolean);
  const withPos = sampled.filter((p) => p.x !== null && p.y !== null && p.x !== undefined && p.y !== undefined);
  if (withPos.length === 0) {
    return { status: 'SKIP', reason: `the figure exposes no placement data (expected ${DOM.placeX} and ${DOM.placeY} on each stop)` };
  }

  const expected = withPos.map((p) => projection.place(byId.get(p.id).lat, byId.get(p.id).lon));
  const shown = withPos.map((p) => [Number(p.x), Number(p.y)]);
  const direct = shown.reduce(
    (worst, s, i) => Math.max(worst, Math.hypot(s[0] - expected[i][0], s[1] - expected[i][1])),
    0
  );
  if (direct <= TOL.geometry) {
    return { status: 'PASS', reason: `${withPos.length} places land within ${direct.toFixed(2)} units of the projection` };
  }

  // The plate may publish its own camera coordinates. The isometric view is a
  // linear map of the projection, so fit that map on three places and check
  // the rest land on it.
  const fit = fitAffine(expected, shown);
  const spread = Math.max(...shown.map((s) => s[0])) - Math.min(...shown.map((s) => s[0]));
  const tol = Math.max(TOL.geometry, 0.005 * spread);
  if (fit !== null && fit <= tol) {
    return { status: 'PASS', reason: `${withPos.length} places land within ${fit.toFixed(2)} units of the projection through the plate's camera` };
  }
  const worst = withPos
    .map((p, i) => ({ id: p.id, d: Math.hypot(shown[i][0] - expected[i][0], shown[i][1] - expected[i][1]) }))
    .sort((a, b) => b.d - a.d)[0];
  return { status: 'FAIL', reason: `the plate's placement misses the projection: worst is ${worst.id} at ${worst.d.toFixed(1)} units (tolerance ${TOL.geometry})` };
}

// 4. Selection raises a readout, and every number in it is the corpus's.
async function checkReadout(ctx) {
  const places = await ctx.readPlaces();
  const first = places[0];
  if (!first) return { status: 'FAIL', reason: 'the plate carries no stop to press' };
  if (!(await ctx.pressPlace(first.id))) {
    return { status: 'FAIL', reason: `no stop could be pressed for ${first.id}` };
  }
  await settle();
  const readout = await ctx.readReadout();
  if (!readout.present) return { status: 'FAIL', reason: `pressing ${first.id} raised no readout` };

  const l = byId.get(first.id);
  const shown = readout.fields;
  const fails = [];
  for (const key of Object.keys(FIELDS)) {
    if (shown[FIELDS[key]] === undefined) fails.push(`the readout has no "${FIELDS[key]}" field`);
  }
  for (const key of Object.keys(FIELDS)) {
    note(`  ${key.padEnd(11)} ${shown[FIELDS[key]] ?? ''}`);
  }

  if (shown[FIELDS.name] !== undefined && !nameMatches(shown[FIELDS.name], l)) {
    fails.push(`the readout calls it "${shown[FIELDS.name]}", the corpus calls it ${l.name}`);
  }
  const numbers = [
    ['cases', l.demand.cases_per_month_total, TOL.cases],
    ['price', l.price.our_mix.blended_price, TOL.rupees],
    ['margin', l.price.our_mix.blended_price - l.economics.cost_per_visit_clustered, TOL.rupees],
    ['saturation', l.competition.saturation_index, 0.5],
  ];
  for (const [key, want, tol] of numbers) {
    const text = shown[FIELDS[key]];
    if (text === undefined) continue;
    const got = firstNumber(text);
    if (got === null) fails.push(`the readout's ${key} reads "${text}", which carries no number`);
    else if (Math.abs(got - want) > tol) fails.push(`the readout's ${key} reads ${got}, the corpus says ${want}`);
  }
  if (shown[FIELDS.verdict] !== undefined && squash(shown[FIELDS.verdict]) !== squash(l.verdict.status)) {
    fails.push(`the readout's verdict reads "${shown[FIELDS.verdict]}", the corpus says ${l.verdict.status}`);
  }
  return fails.length
    ? { status: 'FAIL', reason: fails.join('; ') }
    : { status: 'PASS', reason: `${first.id} reads back its corpus numbers` };
}

// 5. The token re-reads the routes, and the routes agree with the corpus.
async function checkToken(ctx) {
  const price0 = await ctx.readToken();
  const routes0 = await ctx.readRoutes();
  if (price0 === null) return { status: 'FAIL', reason: `the figure exposes no token price (expected ${DOM.tokenValue})` };
  if (Object.keys(routes0).length === 0) return { status: 'FAIL', reason: `the figure exposes no route readouts (expected ${DOM.route})` };

  const moved = await moveToken(ctx.page, DOM, String(price0));
  const price1 = await ctx.readToken();
  const routes1 = await ctx.readRoutes();
  if (price1 === price0) {
    return { status: 'FAIL', reason: `the token did not move: still at ${price0} after ${moved}` };
  }
  const changed = Object.keys(routes1).filter((k) => routes1[k].value !== routes0[k]?.value);
  if (changed.length === 0) {
    return { status: 'FAIL', reason: `the token moved from ${price0} to ${price1} but no route readout changed` };
  }

  // What a route may legitimately read at a price, all of it from the corpus:
  // one route's contribution, two routes', one route's revenue, or the whole
  // cluster's contribution or revenue.
  const readings = (c, p) => [
    ['one route contribution', c.routeCases * (p - CLUSTER_COST), c.routeCases],
    ['two route contribution', 2 * c.routeCases * (p - CLUSTER_COST), 2 * c.routeCases],
    ['one route revenue', c.routeCases * p, c.routeCases],
    ['cluster contribution', c.cases * (p - CLUSTER_COST), c.cases],
    ['cluster revenue', c.cases * p, c.cases],
  ];
  const fails = [];
  const matched = new Set();
  const dp = price1 - price0;
  for (const [id, r] of Object.entries(routes1)) {
    const c = clusters.get(id);
    if (!c) {
      fails.push(`route ${id} is not a corpus cluster`);
      continue;
    }
    const got = r.value;
    if (got === null) {
      fails.push(`route ${id} reads "${r.text}", which carries no number`);
      continue;
    }
    const want = readings(c, price1);
    const before = routes0[id]?.value ?? firstNumber(routes0[id]?.text);
    const hit = want.find(([, value, slope]) => {
      const valueTol = Math.max(2, TOL.contribution * Math.abs(value));
      const deltaTol = Math.max(2, TOL.contribution * Math.abs(slope * dp));
      const deltaOk = before === null || before === undefined ? true : Math.abs((got - before) - slope * dp) <= deltaTol;
      return Math.abs(got - value) <= valueTol && deltaOk;
    });
    if (!hit) {
      fails.push(
        `route ${id} reads ${got} at ${price1}, the corpus says one route ${Math.round(want[0][1])}, one route revenue ${Math.round(want[2][1])} or cluster ${Math.round(want[3][1])}`
      );
    } else {
      matched.add(hit[0]);
    }
  }
  return fails.length
    ? { status: 'FAIL', reason: fails.slice(0, 3).join('; ') + (fails.length > 3 ? `; and ${fails.length - 3} more` : '') }
    : { status: 'PASS', reason: `token ${price0} to ${price1}, ${Object.keys(routes1).length} routes re-read (${[...matched].join(', ')})` };
}

// 3. The plate is actually painted. The kit's own rules ship with the
// standalone page, but the site has to carry them itself; when they are
// missing every solid inherits a black fill and every line inherits no
// stroke, and the figure on the page is a black blob. Only the built site
// can prove this, so this check runs here and not in the figure's own build.
async function checkRender(ctx) {
  const paint = await ctx.page.evaluate((dom) => {
    const fig = document.querySelector(dom.figure);
    if (!fig) return null;
    const take = (sel) => [...fig.querySelectorAll(sel)].slice(0, 60);
    const fills = take('.iso-fill');
    const shades = take('.iso-shade');
    const lines = take('.iso-line');
    const colours = (nodes, prop) => [...new Set(nodes.map((n) => getComputedStyle(n)[prop]))];
    return {
      solids: fills.length,
      shades: shades.length,
      lines: lines.length,
      fillColours: colours(fills, 'fill'),
      shadeColours: colours(shades, 'fill'),
      strokeColours: colours(lines, 'stroke'),
    };
  }, DOM);

  if (!paint) return { status: 'FAIL', reason: 'the figure is not on the page' };

  const fails = [];
  if (!paint.solids) fails.push('the plate carries no solids at all');
  if (paint.fillColours.includes('rgb(0, 0, 0)')) {
    fails.push('a solid is filled black: the kit rules are missing from the site stylesheet');
  }
  if (paint.lines && paint.strokeColours.every((c) => c === 'none')) {
    fails.push('no line carries a stroke: the kit rules are missing from the site stylesheet');
  }
  if (paint.shades && paint.shadeColours.length < 2) {
    fails.push(`the four tones from facing are missing: ${paint.shadeColours.length} tone found`);
  }
  if (fails.length) return { status: 'FAIL', reason: fails.join('; ') };
  return {
    status: 'PASS',
    reason: `${paint.solids} solids painted, ${paint.shadeColours.length} tones from facing, ${paint.strokeColours.length} line inks`,
  };
}

// 6. The board filters the plate.
async function checkFilter(ctx) {
  if (!(await ctx.page.$(BOARD.zone)) || !(await ctx.page.$(BOARD.verdict))) {
    return { status: 'SKIP', reason: 'the page has no decision board to filter with' };
  }
  const fails = [];
  await ctx.page.select(BOARD.zone, 'A');
  await settle();
  const inZone = await ctx.readPlaces();
  const dimmedA = inZone.filter((p) => p.zone === 'A' && p.dimmed);
  const dimmedB = inZone.filter((p) => p.zone === 'B' && !p.dimmed);
  if (dimmedA.length) fails.push(`${dimmedA.length} Zone A stops are dimmed under the Zone A filter`);
  if (dimmedB.length) fails.push(`${dimmedB.length} Zone B stops are still at full contrast under the Zone A filter`);

  // Zone A has no NO-GO stop, so this filter matches nothing at all.
  await ctx.page.select(BOARD.verdict, 'NO-GO');
  await settle();
  const none = await ctx.readPlaces();
  const lit = none.filter((p) => !p.dimmed);
  const emptyShown = await ctx.page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? !el.hidden : null;
  }, BOARD.empty);
  if (lit.length) fails.push(`${lit.length} stops are still lit under a filter that matches nothing`);
  if (emptyShown !== true) fails.push('the empty state did not appear under a filter that matches nothing');

  await ctx.page.select(BOARD.verdict, '');
  await ctx.page.select(BOARD.zone, '');
  await settle();
  const stillDim = (await ctx.readPlaces()).filter((p) => p.dimmed);
  if (stillDim.length) fails.push(`${stillDim.length} stops stayed dimmed after the filter was cleared`);

  return fails.length
    ? { status: 'FAIL', reason: fails.join('; ') }
    : { status: 'PASS', reason: 'Zone A lit, Zone B dimmed, empty filter dims the plate' };
}

// 7. Keyboard reaches a place, arrows move along a route, Enter selects.
async function checkKeyboard(ctx) {
  const walk = await tabToAPlace(ctx.page, DOM);
  if (!walk.place) return { status: 'FAIL', reason: `${walk.presses} tab presses never reached a stop` };

  const before = walk.place;
  const l = byId.get(before);
  if (!l) return { status: 'FAIL', reason: `the stop the keyboard reached, "${before}", is not in the corpus` };

  let along = null;
  let key = '';
  for (const k of ['ArrowRight', 'ArrowLeft']) {
    await ctx.page.keyboard.press(k);
    await settle(80);
    const at = await activePlace(ctx.page, DOM);
    if (at && at !== before) {
      along = at;
      key = k;
      break;
    }
  }
  if (!along) return { status: 'FAIL', reason: `no arrow key moved along the route from ${before}` };

  const other = byId.get(along);
  if (!other || other.route_cluster !== l.route_cluster) {
    return { status: 'FAIL', reason: `${key} moved from ${before} to ${along}, which is not on the same route` };
  }
  await ctx.page.keyboard.press('Enter');
  await settle();
  const readout = await ctx.readReadout();
  if (!readout.present || !nameMatches(readout.fields[FIELDS.name], other)) {
    return { status: 'FAIL', reason: `Enter on ${along} did not raise its readout` };
  }
  return {
    status: 'PASS',
    reason: `Tab x${walk.presses} reached ${before}, ${key} to ${along} (route ${other.route_cluster}), Enter selected it`,
  };
}

// 8. Deep link in, deep link out.
async function checkDeepLink(ctx) {
  const target = corpus[4].id;
  await ctx.page.goto(`${ctx.origin}/zones/?place=${target}`, { waitUntil: 'networkidle0' });
  await settle();
  const linked = await ctx.readReadout();
  const marked = (await ctx.readPlaces()).find((p) => p.id === target)?.selected;
  const fails = [];
  if (!linked.present) fails.push('the deep link raised no readout');
  else if (!nameMatches(linked.fields[FIELDS.name], byId.get(target))) {
    fails.push(`the deep link raised "${linked.fields[FIELDS.name]}", not ${byId.get(target).name}`);
  }
  if (marked !== true) fails.push(`the deep link did not mark ${target} as selected`);

  const shared = corpus[9].id;
  await ctx.pressPlace(shared);
  await settle();
  const href = await ctx.page.evaluate(() => location.href);
  if (!href.includes(shared)) fails.push(`selecting ${shared} left the URL at ${href}`);

  return fails.length
    ? { status: 'FAIL', reason: fails.join('; ') }
    : { status: 'PASS', reason: `?place=${target} selects on load, selecting ${shared} writes the URL` };
}

// 9. No console errors, on load or after any of it.
function checkConsole(ctx) {
  return ctx.consoleErrors.length
    ? { status: 'FAIL', reason: `${ctx.consoleErrors.length} console error(s): ${ctx.consoleErrors.slice(0, 3).join(' | ')}` }
    : { status: 'PASS', reason: 'no console errors on load or after any interaction' };
}

// 10. On a phone the figure is there, whole, and pressable.
async function checkMobile(ctx) {
  await ctx.page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await ctx.page.goto(`${ctx.origin}/zones/`, { waitUntil: 'networkidle0' });
  await settle();
  const view = await ctx.page.evaluate((dom) => {
    const el = document.querySelector(dom.figure);
    const r = el?.getBoundingClientRect();
    return {
      present: Boolean(el),
      left: r?.left ?? 0,
      right: r?.right ?? 0,
      width: r?.width ?? 0,
      height: r?.height ?? 0,
      scrollWidth: document.documentElement.scrollWidth,
    };
  }, DOM);
  if (!view.present) return { status: 'FAIL', reason: 'the figure is not on the page at 390 pixels' };
  if (view.width <= 0 || view.height <= 0) {
    return { status: 'FAIL', reason: `the figure has no size at 390 pixels (${view.width} x ${view.height})` };
  }
  if (view.width > 392 || view.left < -2 || view.right > 392) {
    return { status: 'FAIL', reason: `the figure is ${view.width.toFixed(0)}px wide in a 390px viewport (${view.left.toFixed(0)} to ${view.right.toFixed(0)})` };
  }
  if (view.scrollWidth > 392) {
    return { status: 'FAIL', reason: `the page scrolls sideways at 390 pixels (${view.scrollWidth}px wide), so the figure is clipped out of the viewport` };
  }

  // The card's own lines: the hint and the readout must not sit on top of
  // each other, and neither may run off the plate.
  const card = await ctx.page.evaluate((dom) => {
    const fig = document.querySelector(dom.figure);
    const hint = fig?.querySelector('.iso-plate-corner[data-corner="hint"]');
    const readout = fig?.querySelector('.iso-plate-corner[data-corner="readout"]');
    if (!fig || !hint || !readout) return null;
    const h = hint.getBoundingClientRect();
    const r = readout.getBoundingClientRect();
    const box = fig.getBoundingClientRect();
    const overlap = !(h.right <= r.left || r.right <= h.left || h.bottom <= r.top || r.bottom <= h.top);
    return {
      overlap,
      readoutClipped: r.right > box.right + 1 || r.left < box.left - 1,
      hintClipped: h.right > box.right + 1 || h.left < box.left - 1,
    };
  }, DOM);
  if (!card) return { status: 'FAIL', reason: 'the card has no hint or readout line' };
  if (card.overlap) return { status: 'FAIL', reason: 'the hint and the readout sit on top of each other at 390 pixels' };
  if (card.readoutClipped || card.hintClipped) {
    return { status: 'FAIL', reason: 'the card runs off the plate at 390 pixels' };
  }

  // A press on the plate has to work on a phone. Inside the dense cluster a
  // pin is three pixels wide and its neighbours overlap it, so the stop the
  // plate can be trusted to answer to is the one with room around it; the
  // appendix table carries the precise per-place route on a phone.
  const target = await ctx.page.evaluate((dom) => {
    const stops = [...document.querySelectorAll(dom.place)];
    const points = stops
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { id: el.getAttribute(dom.placeId), x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })
      .filter((p) => Number.isFinite(p.x));
    if (!points.length) return null;
    let best = null;
    for (const p of points) {
      let nearest = Infinity;
      for (const q of points) {
        if (q === p) continue;
        nearest = Math.min(nearest, Math.hypot(q.x - p.x, q.y - p.y));
      }
      if (!best || nearest > best.nearest) best = { ...p, nearest };
    }
    return best;
  }, DOM);
  if (!target) return { status: 'FAIL', reason: 'the plate carries no stops to press' };

  const handle = await ctx.page.$(`${DOM.place}[${DOM.placeId}="${target.id}"]`);
  if (!handle) return { status: 'FAIL', reason: `no stop for ${target.id} to tap` };
  await handle.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await settle(80);
  const spot = await rectOf(handle);
  await ctx.page.touchscreen.tap(spot.x + spot.width / 2, spot.y + spot.height / 2);
  await settle();
  const tapped = await ctx.readReadout();
  if (!tapped.present || !nameMatches(tapped.fields[FIELDS.name], byId.get(target.id))) {
    return { status: 'FAIL', reason: `a tap on ${target.id} raised no readout` };
  }
  return {
    status: 'PASS',
    reason: `the figure fits 390px, the card lines do not collide, and a tap on ${target.id} selects it`,
  };
}

// --- The run ------------------------------------------------------------------
const server = await startStaticServer(resolve(root, 'dist'));
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--font-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});

let phase = 'load';
const consoleErrors = [];

try {
  const page = await browser.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`${phase}: ${m.text()}`);
  });
  page.on('pageerror', (e) => consoleErrors.push(`${phase}: ${String(e)}`));

  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(`${server.origin}/zones/`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');

  const ctx = {
    page,
    origin: server.origin,
    consoleErrors,
    readPlaces: () =>
      page.evaluate((dom) => {
        const val = (el, name) => el.getAttribute(name);
        return Array.from(document.querySelectorAll(dom.place)).map((el) => {
          const dim = val(el, dom.dimmed);
          return {
            id: val(el, dom.placeId),
            zone: val(el, dom.zone),
            cluster: val(el, dom.cluster),
            verdict: val(el, dom.verdict),
            dimmed: el.hasAttribute(dom.dimmed) && dim !== 'false' && dim !== '0',
            x: val(el, dom.placeX),
            y: val(el, dom.placeY),
            selected: dom.selected.some((sel) => el.matches(sel)),
          };
        });
      }, DOM),
    readReadout: () =>
      page.evaluate((dom) => {
        const root = document.querySelector(dom.readout);
        const scope = root ?? document;
        const fields = {};
        for (const el of scope.querySelectorAll(`[${dom.readoutField}]`)) {
          fields[el.getAttribute(dom.readoutField)] = (el.textContent ?? '').trim();
        }
        return { present: Boolean(root), fields };
      }, DOM),
    readToken: () =>
      page.evaluate((dom) => {
        const raw =
          document.querySelector(dom.token)?.getAttribute(dom.tokenValue) ??
          document.querySelector(`[${dom.tokenValue}]`)?.getAttribute(dom.tokenValue);
        return raw === null || raw === undefined ? null : Number(raw);
      }, DOM),
    readRoutes: () =>
      page.evaluate((dom) => {
        const num = (s) => {
          const m = String(s ?? '')
            .replace(/,/g, '')
            .match(/-?\d+(?:\.\d+)?/);
          return m ? Number(m[0]) : null;
        };
        const out = {};
        for (const el of document.querySelectorAll(dom.route)) {
          const id = el.getAttribute(dom.cluster) ?? el.getAttribute('data-route');
          const text = (el.textContent ?? '').trim();
          out[id] = { value: num(el.getAttribute(dom.route)) ?? num(text), text };
        }
        return out;
      }, DOM),
    // Pressing a stop: an SVG element has no click() of its own, so the press
    // is dispatched as the event a reader's pointer would send.
    pressPlace: (id) =>
      page.evaluate(
        (dom, id) => {
          const el = document.querySelector(`${dom.place}[${dom.placeId}="${id}"]`);
          if (!el) return false;
          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          return true;
        },
        DOM,
        id
      ),
  };

  const figureCount = await page.evaluate((dom) => document.querySelectorAll(dom.figure).length, DOM);

  // Without the figure there is nothing to prove: say so and leave the exit
  // code alone, so a half-built site does not fail a run.
  if (figureCount === 0) {
    let why = 'the Corridor Bench is not on the page';
    try {
      const source = await readFile(join(root, 'src', 'pages', 'zones.astro'), 'utf8');
      if (source.includes('data-figure')) why = 'the figure is in src/pages/zones.astro but the built site is older — run npm run build';
    } catch {
      /* the source is not readable; the default message stands */
    }
    note(`the Corridor Bench is not in the built page: ${why}`);
    note('');
    for (const name of CHECKS) record(name, 'SKIP', 'the figure is not on the page');
  } else {
    const run = async (name, fn) => {
      phase = name;
      try {
        const { status, reason } = await fn(ctx);
        record(name, status, reason);
      } catch (err) {
        record(name, 'FAIL', `the check could not run: ${String(err)}`);
      }
    };
    await run('places', checkPlaces);
    await run('geometry', checkGeometry);
    await run('render', checkRender);
    await run('readout', checkReadout);
    await run('token', checkToken);
    await run('filter', checkFilter);
    await run('keyboard', checkKeyboard);
    await run('deep link', checkDeepLink);
    await run('console', checkConsole);
    await run('mobile', checkMobile);
  }

  note('');
  const failed = results.filter((r) => r.status === 'FAIL');
  const skipped = results.filter((r) => r.status === 'SKIP');
  const passed = results.filter((r) => r.status === 'PASS').length;
  note(
    failed.length
      ? `${failed.length} of ${results.length} checks fail${skipped.length ? `, ${skipped.length} skipped` : ''}`
      : passed
        ? `${passed} of ${results.length} checks pass${skipped.length ? `, ${skipped.length} skipped` : ''}`
        : `nothing was checked: ${skipped.length} skipped`
  );
  for (const f of failed) note(`  x ${f.name}: ${f.reason}`);
  if (failed.length) process.exitCode = 1;
} catch (err) {
  note(`the run broke before it could finish: ${String(err)}`);
  process.exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}

// --- The helpers --------------------------------------------------------------

// The isometric camera is a linear map of the projected ground plane, so a
// plate that publishes its own coordinates still has to sit on the projection.
function fitAffine(expected, shown) {
  if (expected.length < 3) return null;
  const u1 = [expected[1][0] - expected[0][0], expected[1][1] - expected[0][1]];
  const u2 = [expected[2][0] - expected[0][0], expected[2][1] - expected[0][1]];
  const v1 = [shown[1][0] - shown[0][0], shown[1][1] - shown[0][1]];
  const v2 = [shown[2][0] - shown[0][0], shown[2][1] - shown[0][1]];
  const det = u1[0] * u2[1] - u2[0] * u1[1];
  if (Math.abs(det) < 1e-9) return null;
  const inv = [
    [u2[1] / det, -u1[1] / det],
    [-u2[0] / det, u1[0] / det],
  ];
  const M = [
    [v1[0] * inv[0][0] + v2[0] * inv[1][0], v1[0] * inv[0][1] + v2[0] * inv[1][1]],
    [v1[1] * inv[0][0] + v2[1] * inv[1][0], v1[1] * inv[0][1] + v2[1] * inv[1][1]],
  ];
  const t = [
    shown[0][0] - (M[0][0] * expected[0][0] + M[0][1] * expected[0][1]),
    shown[0][1] - (M[1][0] * expected[0][0] + M[1][1] * expected[0][1]),
  ];
  let worst = 0;
  for (let i = 0; i < expected.length; i++) {
    const px = M[0][0] * expected[i][0] + M[0][1] * expected[i][1] + t[0];
    const py = M[1][0] * expected[i][0] + M[1][1] * expected[i][1] + t[1];
    worst = Math.max(worst, Math.hypot(px - shown[i][0], py - shown[i][1]));
  }
  return worst;
}

// The token may be a drag target or a focusable control, so try the drag the
// reader would make first and fall back to the keyboard.
async function moveToken(page, dom, before) {
  const handle = await page.$(dom.token);
  if (!handle) return 'no token element';
  const price = () => page.evaluate((d) => document.querySelector(d.token)?.getAttribute(d.tokenValue), dom);
  // The token sits at the foot of a tall figure, so it has to be on screen
  // before the pointer can reach it.
  await handle.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await settle(80);
  const spot = await rectOf(handle);
  if (spot) {
    await page.mouse.move(spot.x + spot.width / 2, spot.y + spot.height / 2);
    await page.mouse.down();
    await page.mouse.move(spot.x + spot.width / 2 + 140, spot.y + spot.height / 2, { steps: 12 });
    await page.mouse.up();
    await settle();
    if ((await price()) !== before) return 'a horizontal drag';
  }
  await handle.focus();
  for (const key of ['ArrowRight', 'ArrowUp', 'End']) {
    await page.keyboard.press(key);
    await settle(60);
    if ((await price()) !== before) return `the keyboard (${key})`;
  }
  return 'neither a drag nor the keyboard';
}

// Where the keyboard is: the focused stop, or the stop the focused element
// points at through aria-activedescendant.
async function activePlace(page, dom) {
  return page.evaluate((d) => {
    const el = document.activeElement;
    if (!el) return null;
    const place = el.closest?.(d.place);
    if (place) return place.getAttribute(d.placeId);
    const active = el.getAttribute('aria-activedescendant');
    if (active) return document.getElementById(active)?.getAttribute(d.placeId) ?? null;
    return null;
  }, dom);
}

// Walk the tab order until the figure's stops are reached, and say how many
// presses it took.
async function tabToAPlace(page, dom) {
  await page.evaluate(() => document.body.focus());
  for (let i = 1; i <= 120; i++) {
    await page.keyboard.press('Tab');
    const place = await activePlace(page, dom);
    if (place) return { place, presses: i };
  }
  return { place: null, presses: 120 };
}
