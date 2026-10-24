// scripts/build-map-figure.mjs
// Builds the Corridor Bench map figure for the locality dossier.
//
// Outputs:
//   src/content/zones/figure.html
//   src/content/zones/figure.css
//   src/content/zones/figure.js
//   dist-figure/corridor-bench.html (standalone audit & preview page)
//   dist-figure/corridor-bench-print.html (standalone print twin still page)
//
// When run with --audit, performs full geometry and depth verification.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as k from '../src/iso/iso-kit.mjs';
import * as A from '../src/iso/audit.mjs';
import { selfCheck as checkProjection, place, fitProjection } from '../src/iso/projection.mjs';
import { buildBench, BENCH, BENCH_H, FOOT_H, PLATE, PLATE_H, RAIL, RAIL_H, GAUGE, PLATEN, LAMP } from '../src/iso/bench.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(root, 'src', 'content', 'zones');
const DIST_DIR = join(root, 'dist-figure');
const SHOTS_DIR = join(root, 'shots');

async function readJson(path, label) {
  try {
    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`build-map-figure: failed to read ${label} at ${path}: ${err.message}`);
  }
}

async function main() {
  console.log('1. Checking projection self-check...');
  checkProjection();
  console.log('   Projection self-check passed.');

  console.log('2. Loading research datasets...');
  const zoneA = await readJson(join(root, 'research', 'zone-a', 'localities.json'), 'Zone A');
  const zoneB = await readJson(join(root, 'research', 'zone-b', 'localities.json'), 'Zone B');
  const osmGeo = await readJson(join(root, 'research', 'map-geometry', 'osm-coast-and-spines.json'), 'OSM Geo');
  const wardsGeo = await readJson(join(root, 'research', 'zone-b', '_work', 'osm_wards.json'), 'Wards Geo');

  const locsA = zoneA.localities;
  const locsB = zoneB.localities;
  const allLocs = [...locsA, ...locsB];
  console.log(`   Loaded ${allLocs.length} localities (Zone A: ${locsA.length}, Zone B: ${locsB.length}).`);

  // Default selection is first locality A01
  const defaultLoc = locsA[0];
  const initialMargin = (defaultLoc.economics?.our_mix?.margin_per_visit_clustered ?? (defaultLoc.price?.our_mix?.blended_price ?? 1304) - 850);

  // Set up audit recorder if --audit flag passed
  const doAudit = process.argv.includes('--audit');
  let R = null;
  const boundsPoints = [
    [-700, -470, -BENCH_H - FOOT_H],
    [700, -470, -BENCH_H - FOOT_H],
    [700, 470, -BENCH_H - FOOT_H],
    [-700, 470, -BENCH_H - FOOT_H],
    [-700, -470, 0],
    [700, -470, 0],
    [700, 470, 0],
    [-700, 470, 0],
    [-590, -380, PLATE_H],
    [590, -380, PLATE_H],
    [590, 380, PLATE_H],
    [-590, 380, PLATE_H],
    [LAMP.x, LAMP.y, LAMP.postH],
  ];
  const P = fitProjection(boundsPoints, 1200, 780, { pad: 36, azimuth: 45, elevation: 34 });

  if (doAudit) {
    R = A.recorder(P, { ground: (s) => true });
    // Record primary solids for the audit
    R.solid(A.slab(BENCH, -BENCH_H, BENCH_H, { name: 'bench.slab', ground: true, spacing: 25 }));
    R.solid(A.slab(PLATE, 0, PLATE_H, { name: 'plate.slab', spacing: 20, owner: 'bench.slab' }));
    R.solid(A.slab(RAIL, 0, RAIL_H, { name: 'rail.body', spacing: 10, owner: 'bench.slab' }));
    R.solid(A.cylinder(GAUGE.x, GAUGE.y, GAUGE.r, 0, GAUGE.h, { name: 'gauge.bezel', owner: 'bench.slab' }));
    R.solid(A.slab({ x: -16, y: RAIL.y - 4, w: 32, d: RAIL.d + 8, r: 2 }, RAIL_H, 8.0, { name: 'token.body', owner: 'rail.body' }));

    // Record all stops with true coordinates and plate host ownership
    for (const loc of allLocs) {
      const [sx, sy] = place(loc.lat, loc.lon);
      R.solid(A.cylinder(sx, sy, 1.8, 5.5, 12, { name: `stop.${loc.id}`, owner: 'plate.slab' }));
    }
  }

  console.log('3. Building Corridor Bench geometry...');
  const benchResult = buildBench({
    localitiesA: locsA,
    localitiesB: locsB,
    osmGeo,
    wardsGeo,
    tokenPrice: 1100,
    selectedId: defaultLoc.id,
    platenOpen: false,
    width: 1200,
    height: 780,
    R,
  });

  const printBenchResult = buildBench({
    localitiesA: locsA,
    localitiesB: locsB,
    osmGeo,
    wardsGeo,
    tokenPrice: 1100,
    selectedId: defaultLoc.id,
    platenOpen: true,
    width: 1200,
    height: 780,
  });

  if (doAudit && R) {
    console.log('4. Settling painter keys and running anatomy audit...');
    A.settle(R, P);
    A.auditOrExit(R, P, { flag: '--audit', argv: process.argv });
  }

  console.log('5. Assembling figure markup, CSS, and JS...');
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(DIST_DIR, { recursive: true });
  await mkdir(SHOTS_DIR, { recursive: true });

  const captionText =
    "A milled dispatch bench showing the two corridors, all hundred localities as machined stop pins standing at their true coordinates, the fifteen routes as brass link bars in travel order, and a movable price token that re-reads every route's margin. Positions are placed from coordinates (cos(lat) correction at 13°N) and are not a survey. Zone A's household base is modelled (tier C) while Zone B's is derived (tier B).";

  // Build figure HTML card
  const figureHtml = `<figure class="iso-figure corridor-bench" id="corridor-bench" data-figure>
  <div class="iso-plate">
    <div class="iso-plate-corners" aria-hidden="true">
      <span class="iso-plate-corner" data-corner="fig">Fig 4</span>
      <span class="iso-plate-corner" data-corner="title">The Corridor Bench</span>
      <span class="iso-plate-corner" data-corner="hint">Click a stop &middot; drag token &middot; arrow keys</span>
      <span class="iso-plate-corner" data-corner="readout">${defaultLoc.id} ${defaultLoc.name} &middot; Rs ${Math.round(initialMargin).toLocaleString('en-IN')} margin</span>
    </div>
    <div class="iso-stage bench-stage" tabindex="0" role="group" aria-label="The Corridor Bench dispatch table. Arrow keys move between stops in route order, Enter selects a stop.">
      ${benchResult.svg}
    </div>
  </div>
  <figcaption class="iso-legend">
    <div class="iso-keys">
      <span class="iso-key"><span class="bench-key-mark bench-key-mark--lit"></span> Price token &amp; selection</span>
      <span class="iso-key"><span class="bench-key-mark bench-key-mark--go"></span> GO (flat disc)</span>
      <span class="iso-key"><span class="bench-key-mark bench-key-mark--hold"></span> HOLD (square head)</span>
      <span class="iso-key"><span class="bench-key-mark bench-key-mark--nogo"></span> NO-GO (cross notch)</span>
      <span class="iso-key"><span class="bench-key-mark bench-key-mark--bar"></span> Brass route link bars (15)</span>
      <span class="iso-key"><span class="bench-key-mark bench-key-mark--tier"></span> Tier bracket (A solid, B dashed, C dotted)</span>
    </div>
    <p class="iso-caption">${captionText}</p>
  </figcaption>
</figure>`;

  // Print twin figure HTML (platen open, still)
  const printFigureHtml = `<figure class="iso-figure corridor-bench corridor-bench--print" id="corridor-bench-print" data-figure>
  <div class="iso-plate">
    <div class="iso-plate-corners" aria-hidden="true">
      <span class="iso-plate-corner" data-corner="fig">Fig 4</span>
      <span class="iso-plate-corner" data-corner="title">The Corridor Bench</span>
      <span class="iso-plate-corner" data-corner="readout">${defaultLoc.id} ${defaultLoc.name} &middot; Rs ${Math.round(initialMargin).toLocaleString('en-IN')} margin</span>
    </div>
    <div class="iso-stage bench-stage">
      ${printBenchResult.svg}
    </div>
  </div>
  <figcaption class="iso-legend">
    <p class="iso-caption">${captionText}</p>
  </figcaption>
</figure>`;

  // Figure CSS
  const figureCss = `/* The Corridor Bench styles — Sign Band world tokens */
.corridor-bench {
  margin: 28px 0 36px;
  --bench-paper: var(--paper, #ffffff);
  --bench-ground: var(--ground, #e8e6e0);
  --bench-panel: var(--panel, #f6f5f1);
  --bench-ink: var(--ink, #111111);
  --bench-ink-2: var(--ink-2, #3a3a36);
  --bench-ink-3: var(--ink-3, #6e6a62);
  --bench-ink-4: var(--ink-4, #8b867d);
  --bench-signal: var(--signal, #f2c200);
  --bench-rule: var(--rule, #111111);
}

.corridor-bench .iso-plate {
  position: relative;
  padding: 48px 16px 20px;
  background: var(--bench-paper);
  border: 1px solid var(--bench-ink);
  border-radius: 0;
  box-shadow: none;
}

.corridor-bench .iso-plate-corners {
  position: absolute;
  inset: 14px 18px;
  pointer-events: none;
}

.corridor-bench .iso-plate-corner {
  position: absolute;
  font-family: var(--face-data, 'Roboto Mono', monospace);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  line-height: 1;
  color: var(--bench-ink-3);
  white-space: nowrap;
}

.corridor-bench .iso-plate-corner[data-corner="fig"] {
  top: 0;
  left: 0;
  color: var(--bench-ink);
  font-weight: 600;
}

.corridor-bench .iso-plate-corner[data-corner="title"] {
  top: 0;
  right: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.corridor-bench .iso-plate-corner[data-corner="hint"] {
  bottom: 0;
  left: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.corridor-bench .iso-plate-corner[data-corner="readout"] {
  bottom: 0;
  right: 0;
  color: var(--bench-ink);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.bench-stage {
  position: relative;
  width: 100%;
  outline: none;
  overflow: hidden;
  cursor: grab;
}

.bench-stage:active {
  cursor: grabbing;
}

.bench-svg {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
}

/* Stop pins interaction */
.bench-stop {
  cursor: pointer;
  transition: opacity 160ms var(--ease, ease);
  outline: none;
}

.bench-stop:hover .bench-stop__highlight,
.bench-stop:focus-visible .bench-stop__highlight {
  opacity: 0.55;
}

.bench-stop.is-selected .bench-stop__highlight {
  opacity: 1 !important;
}

.bench-stop.is-dimmed {
  opacity: 0.16;
}

.bench-stage.is-empty .bench-stop {
  opacity: 0.12;
}

/* Token slider */
.bench-token {
  cursor: ew-resize;
  outline: none;
  transition: transform 80ms ease-out;
}

.bench-token:focus-visible {
  filter: drop-shadow(0 0 2px var(--bench-signal));
}

/* Gauge needle */
.bench-gauge__needle {
  transform-origin: 440px 385px;
  transition: transform 220ms var(--ease, ease);
}

/* Platen */
.bench-platen {
  transition: transform 320ms cubic-bezier(0.16, 0.84, 0.44, 1);
}

.bench-platen.is-open {
  transform: translate(25px, 45px);
}

/* Legend and keys */
.corridor-bench .iso-legend {
  margin-top: 14px;
  color: var(--bench-ink-3);
  font-size: 12.5px;
  line-height: 1.5;
}

.corridor-bench .iso-keys {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-bottom: 8px;
}

.corridor-bench .iso-key {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--face-data, 'Roboto Mono', monospace);
  font-size: 11px;
  color: var(--bench-ink-2);
}

.bench-key-mark {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1px solid var(--bench-ink);
}

.bench-key-mark--lit {
  background: var(--bench-signal);
  border-color: var(--bench-signal);
}

.bench-key-mark--go {
  border-radius: 50%;
  background: var(--bench-ink);
}

.bench-key-mark--hold {
  border-radius: 0;
  background: var(--bench-ink);
}

.bench-key-mark--nogo {
  position: relative;
  border-radius: 50%;
  background: var(--bench-paper);
}

.bench-key-mark--nogo::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 4px;
  width: 1px;
  height: 6px;
  background: var(--bench-ink);
}

.bench-key-mark--bar {
  width: 16px;
  height: 4px;
  background: rgba(17, 17, 17, 0.7);
  border: none;
}

.bench-key-mark--tier {
  width: 14px;
  height: 2px;
  border-bottom: 2px dashed var(--bench-ink-3);
  border-top: none;
  border-left: none;
  border-right: none;
}

.corridor-bench .iso-caption {
  margin: 0;
  color: var(--bench-ink-3);
  font-size: 12px;
  line-height: 1.5;
}

/* Print twin styles */
.corridor-bench--print .bench-platen {
  transform: translate(25px, 45px);
}

.corridor-bench--print * {
  animation: none !important;
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .corridor-bench * {
    animation: none !important;
    transition: none !important;
  }
}

@media (max-width: 640px) {
  .corridor-bench .iso-plate {
    padding: 44px 8px 16px;
  }
  .corridor-bench .iso-plate-corner {
    font-size: 9.5px;
  }
  .corridor-bench .iso-keys {
    gap: 6px 12px;
  }
}
`;

  // Minimal serialized data for client script
  const clientData = {
    localities: allLocs.map((l) => ({
      id: l.id,
      name: l.name,
      zone: l.zone || l.id[0],
      cluster: l.route_cluster,
      ward: l.ward,
      lat: l.lat,
      lon: l.lon,
      cases: Number(l.demand?.cases_per_month_total || 0),
      blend: Math.round(l.price?.our_mix?.blended_price || 1308),
      cost: l.economics?.cost_per_visit_clustered || 850,
      margin: Math.round((l.price?.our_mix?.blended_price || 1308) - (l.economics?.cost_per_visit_clustered || 850)),
      saturation: l.competition?.saturation_index || 30,
      verdict: l.verdict?.status || 'GO',
      reason: l.verdict?.reason || '',
      travelMin: l.travel_min_to_hub || 30,
      tier: l.demand?.tier || l.pet_base?.tier || 'C',
    })),
    clusters: Array.from(new Set(allLocs.map((l) => l.route_cluster))).sort(),
  };

  // Figure JS (client-side interaction module)
  const figureJs = `// Corridor Bench client interaction
(function () {
  const DATA = ${JSON.stringify(clientData)};
  const locMap = new Map(DATA.localities.map((l) => [l.id, l]));

  const stage = document.querySelector('.bench-stage');
  const readout = document.querySelector('.iso-plate-corner[data-corner="readout"]');
  const needle = document.querySelector('.bench-gauge__needle');
  const platen = document.querySelector('.bench-platen');
  const token = document.querySelector('.bench-token');
  const stops = Array.from(document.querySelectorAll('[data-place]'));

  if (!stage) return;

  let currentLoc = locMap.get('A01') || DATA.localities[0];
  let currentPrice = 1100;
  let touring = true;
  let idleTimer = null;
  const prefersStill = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Rail bounds for token drag
  const RAIL_LEFT = -320;
  const RAIL_RIGHT = 320;
  const PRICE_MIN = 50;
  const PRICE_MAX = 1600;

  function setReadout(loc, price) {
    const margin = Math.round(price - 850);
    if (readout) {
      readout.textContent = loc.id + ' ' + loc.name + ' \u00b7 Rs ' + margin.toLocaleString('en-IN') + ' margin';
    }
  }

  function setNeedle(margin) {
    if (!needle) return;
    const fraction = Math.max(0, Math.min(1, margin / 600));
    const deg = -135 + fraction * 270;
    needle.setAttribute('transform', 'rotate(' + deg.toFixed(1) + ' 440 415)');
  }

  function selectStop(id, updateUrl) {
    const loc = locMap.get(id);
    if (!loc) return;
    currentLoc = loc;

    stops.forEach((s) => {
      const match = s.getAttribute('data-place-id') === id;
      s.classList.toggle('is-selected', match);
      s.setAttribute('aria-selected', match ? 'true' : 'false');
      if (match) s.setAttribute('data-selected', '');
      else s.removeAttribute('data-selected');
      const hi = s.querySelector('.bench-stop__highlight');
      if (hi) hi.setAttribute('opacity', match ? '1' : '0');
    });

    if (platen) {
      platen.classList.add('is-open');
      const fName = platen.querySelector('[data-readout-field="name"]');
      const fCases = platen.querySelector('[data-readout-field="cases"]');
      const fPrice = platen.querySelector('[data-readout-field="price"]');
      const fMargin = platen.querySelector('[data-readout-field="margin"]');
      const fSat = platen.querySelector('[data-readout-field="saturation"]');
      const fVerdict = platen.querySelector('[data-readout-field="verdict"]');
      const pMeta = platen.querySelector('.platen-meta');

      if (fName) fName.textContent = loc.name;
      if (fCases) fCases.textContent = loc.cases.toFixed(1);
      if (fPrice) fPrice.textContent = loc.blend.toLocaleString('en-IN');
      if (fMargin) fMargin.textContent = loc.margin.toLocaleString('en-IN');
      if (fSat) fSat.textContent = String(loc.saturation);
      if (fVerdict) fVerdict.textContent = loc.verdict;
      if (pMeta) pMeta.textContent = loc.id + ' \u00b7 ' + loc.cluster + ' \u00b7 ' + (loc.ward || '').split('(')[0].trim();
    }

    setReadout(currentLoc, currentPrice);
    setNeedle(loc.margin);

    if (updateUrl) {
      const url = new URL(window.location);
      url.searchParams.set('place', id);
      window.history.replaceState({}, '', url.toString());
    }

    // Scroll board to matching gate row if present
    const boardRow = document.querySelector('#board [data-gate="' + loc.cluster + '"]');
    if (boardRow) {
      boardRow.classList.add('gate--target');
    }
  }

  function setTokenPrice(price) {
    currentPrice = Math.max(PRICE_MIN, Math.min(PRICE_MAX, price));
    const frac = (currentPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN);
    const xOffset = (frac - 0.5) * (RAIL_RIGHT - RAIL_LEFT);

    if (token) {
      token.setAttribute('transform', 'translate(' + xOffset.toFixed(1) + ', 0)');
      token.setAttribute('data-token-value', String(Math.round(currentPrice)));
      token.setAttribute('aria-valuenow', String(Math.round(currentPrice)));
      token.setAttribute('aria-valuetext', 'Rs ' + Math.round(currentPrice).toLocaleString('en-IN'));
    }

    setReadout(currentLoc, currentPrice);
    setNeedle(currentPrice - 850);

    // Update all route contributions
    const routeContrib = Math.round(156 * (currentPrice - 850));
    document.querySelectorAll('[data-route-contribution]').forEach((el) => {
      el.setAttribute('data-route-contribution', String(routeContrib));
      el.setAttribute('[data-route-contribution]', String(routeContrib));
      const txt = el.querySelector('text');
      if (txt) {
        txt.textContent = String(routeContrib);
      }
    });
  }

  // Stop pins: click, touch, pointer, and keyboard listeners
  stops.forEach((s) => {
    const id = s.getAttribute('data-place-id');
    const onActivate = (e) => {
      e.stopPropagation();
      stopTour();
      selectStop(id, true);
    };
    s.addEventListener('click', onActivate);
    s.addEventListener('pointerdown', onActivate);
    s.addEventListener('touchstart', onActivate, { passive: true });
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        stopTour();
        selectStop(id, true);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        stopTour();
        const loc = locMap.get(id);
        if (!loc) return;
        const inCluster = DATA.localities.filter((l) => l.cluster === loc.cluster);
        const idx = inCluster.findIndex((l) => l.id === id);
        let nextIdx = idx;
        if (e.key === 'ArrowRight') {
          nextIdx = idx < inCluster.length - 1 ? idx + 1 : 0;
        } else {
          nextIdx = idx > 0 ? idx - 1 : inCluster.length - 1;
        }
        const nextId = inCluster[nextIdx].id;
        const targetEl = document.querySelector('[data-place][data-place-id="' + nextId + '"]');
        if (targetEl) targetEl.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        stopTour();
        const loc = locMap.get(id);
        if (!loc) return;
        const cIdx = DATA.clusters.indexOf(loc.cluster);
        const nextCIdx = e.key === 'ArrowDown'
          ? (cIdx < DATA.clusters.length - 1 ? cIdx + 1 : 0)
          : (cIdx > 0 ? cIdx - 1 : DATA.clusters.length - 1);
        const nextClusterLocs = DATA.localities.filter((l) => l.cluster === DATA.clusters[nextCIdx]);
        if (nextClusterLocs.length) {
          const nextId = nextClusterLocs[0].id;
          const targetEl = document.querySelector('[data-place][data-place-id="' + nextId + '"]');
          if (targetEl) targetEl.focus();
        }
      }
    });
  });

  // Token dragging & keyboard
  let dragging = false;
  let dragStartX = 0;
  let dragStartPrice = 1100;

  if (token) {
    const startDrag = (e) => {
      stopTour();
      dragging = true;
      dragStartX = e.clientX;
      dragStartPrice = currentPrice;
      try { token.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    };

    token.addEventListener('pointerdown', startDrag);
    token.addEventListener('mousedown', startDrag);

    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      const priceDelta = dx * 2.5;
      setTokenPrice(dragStartPrice + priceDelta);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('mousemove', onMove);

    const stopDrag = (e) => {
      if (dragging) {
        dragging = false;
        try { token.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };

    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);

    token.addEventListener('keydown', (e) => {
      stopTour();
      let step = 0;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') step = 25;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') step = -25;
      if (e.key === 'PageUp') step = 100;
      if (e.key === 'PageDown') step = -100;
      if (e.key === 'Home') { setTokenPrice(PRICE_MIN); e.preventDefault(); return; }
      if (e.key === 'End') { setTokenPrice(PRICE_MAX); e.preventDefault(); return; }
      if (step !== 0) {
        e.preventDefault();
        setTokenPrice(currentPrice + step);
      }
    });
  }

  // Decision board cross-filter listener
  function syncWithBoard() {
    const zoneSelect = document.querySelector('select[data-filter="zone"]');
    const verdictSelect = document.querySelector('select[data-filter="verdict"]');
    const fZone = zoneSelect ? zoneSelect.value : '';
    const fVerdict = verdictSelect ? verdictSelect.value.toUpperCase() : '';

    let visibleCount = 0;
    stops.forEach((s) => {
      const sz = s.getAttribute('data-zone');
      const sv = (s.getAttribute('data-verdict') || '').toUpperCase();
      const match = (!fZone || sz === fZone) && (!fVerdict || sv === fVerdict);

      if (match) {
        s.removeAttribute('data-dimmed');
        s.classList.remove('is-dimmed');
        visibleCount++;
      } else {
        s.setAttribute('data-dimmed', 'true');
        s.classList.add('is-dimmed');
      }
    });

    stage.classList.toggle('is-empty', visibleCount === 0);
  }

  document.addEventListener('change', (e) => {
    if (e.target && e.target.matches && e.target.matches('select[data-filter]')) {
      syncWithBoard();
    }
  });
  syncWithBoard();

  // Deep linking: read URL parameter ?place= or hash #place-
  function checkDeepLink() {
    const url = new URL(window.location);
    const param = url.searchParams.get('place');
    const hash = window.location.hash;
    let target = param;
    if (!target && hash.startsWith('#place-')) {
      target = hash.replace('#place-', '');
    }
    if (target && locMap.has(target)) {
      selectStop(target, false);
    }
  }
  checkDeepLink();
  window.addEventListener('popstate', checkDeepLink);
  window.addEventListener('hashchange', checkDeepLink);

  // Idle tour
  let tourFrame = 0;
  let tourClock = 0;
  function tourTick() {
    if (!touring || prefersStill) return;
    tourClock += 0.015;
    const tourPrice = 1100 + Math.sin(tourClock * 0.7) * 160;
    setTokenPrice(tourPrice);
    tourFrame = requestAnimationFrame(tourTick);
  }

  function stopTour() {
    touring = false;
    cancelAnimationFrame(tourFrame);
    clearTimeout(idleTimer);
  }

  function startIdleTimer() {
    if (prefersStill) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      touring = true;
      cancelAnimationFrame(tourFrame);
      tourFrame = requestAnimationFrame(tourTick);
    }, 8000);
  }

  ['pointerdown', 'mousemove', 'keydown', 'wheel', 'touchstart'].forEach((ev) => {
    window.addEventListener(ev, () => {
      stopTour();
      startIdleTimer();
    }, { passive: true });
  });

  startIdleTimer();
})();
`;

  // Write files
  await writeFile(join(OUT_DIR, 'figure.html'), figureHtml, 'utf8');
  await writeFile(join(OUT_DIR, 'figure-print.html'), printFigureHtml, 'utf8');
  await writeFile(join(OUT_DIR, 'figure.css'), figureCss, 'utf8');
  await writeFile(join(OUT_DIR, 'figure.js'), figureJs, 'utf8');
  console.log('   Wrote src/content/zones/figure.html, figure-print.html, figure.css, figure.js');

  // Write standalone preview and test pages
  const standaloneHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>The Corridor Bench &mdash; Preview</title>
  <link rel="stylesheet" href="../../src/styles/tokens.css"/>
  <style>
    ${k.ISO_CSS}
    ${figureCss}
    body {
      background: var(--paper, #ffffff);
      color: var(--ink, #111111);
      font-family: var(--face, 'Public Sans', sans-serif);
      padding: 40px 20px;
      max-width: 1240px;
      margin: 0 auto;
    }
  </style>
</head>
<body class="iso" data-theme="light">
  ${figureHtml}
  <script>${figureJs}</script>
</body>
</html>`;

  const printStandaloneHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>The Corridor Bench &mdash; Print Twin</title>
  <link rel="stylesheet" href="../../src/styles/tokens.css"/>
  <style>
    ${k.ISO_CSS}
    ${figureCss}
    body {
      background: var(--paper, #ffffff);
      color: var(--ink, #111111);
      font-family: var(--face, 'Public Sans', sans-serif);
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  </style>
</head>
<body class="iso" data-theme="light">
  ${printFigureHtml}
</body>
</html>`;

  await writeFile(join(DIST_DIR, 'corridor-bench.html'), standaloneHtml, 'utf8');
  await writeFile(join(DIST_DIR, 'corridor-bench-print.html'), printStandaloneHtml, 'utf8');
  console.log('   Wrote dist-figure/corridor-bench.html and corridor-bench-print.html');

  console.log('build-map-figure: complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
