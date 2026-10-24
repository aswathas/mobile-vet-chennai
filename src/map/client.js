// The Locality Map — client layer.
//
// The map is drawn once, from the corpus, and this layer moves it: it zooms
// and pans the sheet, merges the marks that overlap into counted clusters,
// lifts a mark under the pointer and reads its numbers, and reads the four
// sliders. Every number it shows comes out of the mark's own data
// attributes, which the build wrote from the research corpus.

import { layoutLabels, markObstacles, clusterObstacle } from './labels.mjs';

(function () {
  const figure = document.querySelector('[data-figure]');
  if (!figure) return;

  const svg = figure.querySelector('.map-svg');
  const stage = figure.querySelector('[data-map-stage]');
  const canvas = figure.querySelector('[data-map-canvas]');
  const clusterLayer = figure.querySelector('.map-clusters');
  let clusterDiscs = [];
  const callout = figure.querySelector('[data-map-callout]');
  const readout = figure.querySelector('[data-readout]');
  const countEl = figure.querySelector('[data-map-count]');
  const zoomButtons = [...figure.querySelectorAll('[data-zoom]')];
  const sliders = [...figure.querySelectorAll('[data-slider]')];
  const sliderValues = [...figure.querySelectorAll('[data-slider-value]')];
  // The board is the site's own instrument, and the page prints it after the
  // figure, so it is not in the document when this script runs. It is looked
  // up when it is needed, never cached at load.
  const getBoard = () => document.getElementById('board');

  if (!svg || !stage) return;

  const places = [...figure.querySelectorAll('[data-place]')];
  if (!places.length) return;

  // --- The view ------------------------------------------------------------
  // The view is a rectangle of the map in metres. Zooming changes its size,
  // panning moves it. The SVG's viewBox carries it, so the geography and the
  // marks move together.
  // Two views: the corridor, where ninety-six of the hundred places sit, and
  // the whole corpus, which reaches forty kilometres west to four localities
  // that are not on the corridor at all.
  const readView = (name) => {
    const raw = svg.getAttribute(name);
    const box = (raw || '').split(/[\s,]+/).map(Number);
    if (box.length !== 4 || box.some((n) => !Number.isFinite(n))) return null;
    return { x: box[0], y: box[1], w: box[2], h: box[3] };
  };
  const full = readView('data-view-full') || (() => {
    const box = svg.getAttribute('viewBox').split(/[\s,]+/).map(Number);
    return { x: box[0], y: box[1], w: box[2], h: box[3] };
  })();
  const home = readView('data-view-band') || full;
  let view = { ...home };

  const ZOOM_MIN = 0.9;
  const ZOOM_MAX = 26;
  const CLUSTER_RADIUS = 22; // screen pixels

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  // The stage's pixel size, and the map metres in one screen pixel.
  const stageSize = () => {
    const rect = stage.getBoundingClientRect();
    return { w: rect.width || 1, h: rect.height || 1 };
  };

  // The corridor, fitted to the panel. The fit contains rather than covers,
  // so no place in the corridor is cropped off the edge of the frame the
  // reader opens on: every one of them has to be reachable without zooming.
  function fitHome() {
    return fitTo(home, 'contain');
  }

  // The whole corpus, fitted to the panel: the four localities west of the
  // corridor and the corridor itself. The corpus is a west-to-east strip, so
  // this fits its width and takes the height the panel's shape asks for. The
  // reader sees the whole spread at once and zooms into the part that
  // matters.
  function fitAll() {
    const size = stageSize();
    const w = full.w;
    const h = (w * size.h) / size.w;
    return {
      x: full.x + (full.w - w) / 2,
      y: full.y + (full.h - h) / 2,
      w,
      h,
    };
  }

  // 'contain' fits the whole extent inside the panel; 'cover' fills the
  // panel and lets the excess fall off the edges.
  function fitTo(extent, mode) {
    const size = stageSize();
    const scale =
      mode === 'cover'
        ? Math.max(size.w / extent.w, size.h / extent.h)
        : Math.min(size.w / extent.w, size.h / extent.h);
    const w = size.w / scale;
    const h = size.h / scale;
    return {
      x: extent.x + (extent.w - w) / 2,
      y: extent.y + (extent.h - h) / 2,
      w,
      h,
    };
  }

  // --- The marks -----------------------------------------------------------
  const marks = places.map((el) => ({
    el,
    id: el.getAttribute('data-place-id'),
    x: Number(el.getAttribute('data-place-x')),
    y: Number(el.getAttribute('data-place-y')),
    zone: el.getAttribute('data-zone'),
    tier: el.getAttribute('data-tier'),
    cluster: el.getAttribute('data-cluster'),
    verdict: el.getAttribute('data-verdict'),
    name: el.getAttribute('data-name'),
    ward: el.getAttribute('data-ward'),
    cases: Number(el.getAttribute('data-cases')),
    price: Number(el.getAttribute('data-price')),
    margin: Number(el.getAttribute('data-margin')),
    saturation: Number(el.getAttribute('data-saturation')),
    travelMin: Number(el.getAttribute('data-travel-min')),
    revenue: Number(el.getAttribute('data-revenue') || 0),
    screenX: 0,
    screenY: 0,
  }));

  const markById = new Map(marks.map((m) => [m.id, m]));

  // --- The scale bar --------------------------------------------------------
  // The bar is drawn in the screen's own space, so its length has to follow
  // the zoom: a kilometre is a different number of pixels at every scale.
  const scaleBar = figure.querySelector('[data-map-scale-bar]');
  const scaleLabel = figure.querySelector('[data-map-scale-label]');

  function renderScaleBar(unitsPerPx) {
    if (!scaleBar) return;
    const metres = 1000;
    const pixels = metres / unitsPerPx;
    // A bar that is too long to sit in the panel is shortened to a round
    // number of kilometres that still fits.
    const choices = [1000, 2000, 5000, 10000, 20000];
    let best = choices[0];
    for (const choice of choices) {
      if (choice / unitsPerPx <= 130) best = choice;
    }
    scaleBar.style.width = `${Math.round(best / unitsPerPx)}px`;
    if (scaleLabel) {
      scaleLabel.textContent = best >= 1000 ? `${best / 1000} km` : `${best} m`;
    }
  }

  // --- Rendering -----------------------------------------------------------
  let hovered = null;
  let selected = null;
  let clusters = [];

  function render() {
    const size = stageSize();
    const unitsPerPx = view.w / size.w;
    svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);

    // The furniture keeps its stroke width when the map zooms.
    for (const group of svg.querySelectorAll('.map-scale, .map-north')) {
      const translate = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(group.getAttribute('transform') || '');
      if (translate) {
        group.setAttribute(
          'transform',
          `translate(${translate[1]} ${translate[2]}) scale(${unitsPerPx.toFixed(6)})`
        );
      }
    }

    for (const mark of marks) {
      mark.screenX = ((mark.x - view.x) / view.w) * size.w;
      mark.screenY = ((mark.y - view.y) / view.h) * size.h;
      mark.el.setAttribute(
        'transform',
        `translate(${mark.x.toFixed(2)} ${mark.y.toFixed(2)}) scale(${unitsPerPx.toFixed(6)})`
      );
    }

    renderClusters(size);
    renderLabels();
    renderScaleBar(unitsPerPx);
  }

  // Marks that sit on top of each other are merged into one mark with a
  // count. Zoom in and they come apart, because they were never moved.
  function renderClusters(size) {
    const placed = [];
    const taken = new Set();

    for (const mark of marks) {
      if (taken.has(mark.id)) continue;
      if (mark.screenX < -40 || mark.screenX > size.w + 40 || mark.screenY < -40 || mark.screenY > size.h + 40) {
        taken.add(mark.id);
        continue;
      }
      const group = [mark];
      taken.add(mark.id);
      for (const other of marks) {
        if (taken.has(other.id)) continue;
        const dx = other.screenX - mark.screenX;
        const dy = other.screenY - mark.screenY;
        if (Math.hypot(dx, dy) <= CLUSTER_RADIUS) {
          group.push(other);
          taken.add(other.id);
        }
      }
      placed.push(group);
    }

    clusters = placed.filter((group) => group.length > 1);

    // The discs the client draws, kept so the label layout knows where they
    // are: a name must not lie across a cluster any more than it may lie
    // across a mark.
    clusterDiscs = clusters.map((group) => {
      const cx = group.reduce((sum, m) => sum + m.x, 0) / group.length;
      const cy = group.reduce((sum, m) => sum + m.y, 0) / group.length;
      const count = group.length;
      return {
        cx,
        cy,
        radius: 9 + Math.min(7, Math.log2(count) * 2.6),
        members: group.map((m) => m.id),
      };
    });

    for (const mark of marks) {
      const inCluster = clusters.some((group) => group.length > 1 && group.includes(mark));
      mark.el.classList.toggle('is-clustered', inCluster);
      mark.el.setAttribute('aria-hidden', inCluster ? 'true' : 'false');
      mark.el.tabIndex = inCluster ? -1 : 0;
    }

    const unitsPerPx = view.w / size.w;
    clusterLayer.innerHTML = clusters
      .map((group) => {
        const cx = group.reduce((sum, m) => sum + m.x, 0) / group.length;
        const cy = group.reduce((sum, m) => sum + m.y, 0) / group.length;
        const count = group.length;
        const radius = 9 + Math.min(7, Math.log2(count) * 2.6);
        const verdicts = new Set(group.map((m) => m.verdict));
        const tone = verdicts.size === 1 ? `map-cluster--${group[0].verdict.toLowerCase().replace('-', '')}` : '';
        const label = group
          .map((m) => `${m.name} (${m.id}), ${m.verdict}, ${Math.round(m.cases)} cases a month`)
          .join('. ');
        return (
          `<g class="map-cluster ${tone}" data-cluster-count="${count}" data-cluster-members="${group.map((m) => m.id).join(' ')}" ` +
          `transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${unitsPerPx.toFixed(6)})" tabindex="0" role="button" ` +
          `aria-label="${count} places here: ${label.replace(/"/g, '&quot;')}">` +
          `<circle class="map-cluster__disc" r="${radius.toFixed(1)}"/>` +
          `<text class="map-cluster__count" y="4">${count}</text>` +
          `</g>`
        );
      })
      .join('');
  }

  // The width of a name, measured rather than guessed. The names are set in
  // the site's own face at twelve pixels, and a name measured by characters
  // rather than by the font is either too long (names that nearly touch) or
  // too short (names that cross a mark they were told to clear).
  const labelWidths = new Map();
  let labelCanvas = null;
  // The face the names are set in, read off one of them.
  const labelEl = svg.querySelector('.map-label text');
  function measureLabel(text) {
    const key = text || '';
    if (labelWidths.has(key)) return labelWidths.get(key);
    let width = key.length * 6.1;
    try {
      if (!labelCanvas) labelCanvas = document.createElement('canvas').getContext('2d');
      const style = getComputedStyle(labelEl);
      labelCanvas.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      width = labelCanvas.measureText(key).width;
    } catch {
      /* the canvas could not be made; the estimate stands */
    }
    labelWidths.set(key, width);
    return width;
  }

  // A name is engraved on the map only when its mark stands on its own, and
  // only where the name has room: a label that would lie across another mark
  // reads as a smudge and hides the very thing it names.
  //
  // Every place has a name ready. Which names are drawn depends on the frame:
  // the places are laid out in order of the revenue they stand for, and each
  // one takes the first of four positions beside its mark that is clear of
  // every other mark and every name already placed.
  function renderLabels() {
    const size = stageSize();

    const candidates = [];
    const unitsPerPx = view.w / size.w;
    for (const group of svg.querySelectorAll('.map-label')) {
      const id = group.getAttribute('data-label-for');
      const mark = markById.get(id);
      const hidden = !mark || mark.el.classList.contains('is-clustered');
      group.toggleAttribute('hidden', hidden);
      if (hidden) continue;

      // The name is drawn in the screen's own size, so its group carries the
      // zoom factor the way the marks do.
      group.setAttribute(
        'transform',
        `translate(${mark.x.toFixed(2)} ${mark.y.toFixed(2)}) scale(${unitsPerPx.toFixed(6)})`
      );
      candidates.push({ group, mark, text: group.querySelector('text') });
    }

    // Every mark that is standing on its own is a thing a label must not cross,
    // and so is every cluster disc: a name over a count hides the count.
    const obstacles = markObstacles(
      marks.map((m) => ({
        id: m.id,
        x: m.screenX,
        y: m.screenY,
        clustered: m.el.classList.contains('is-clustered'),
      }))
    );

    for (const disc of clusterDiscs) {
      const sx = ((disc.cx - view.x) / view.w) * size.w;
      const sy = ((disc.cy - view.y) / view.h) * size.h;
      obstacles.push(clusterObstacle({ id: disc.members.join(','), x: sx, y: sy, radius: disc.radius }));
    }

    // The furniture the names must keep clear of: the zoom control on the
    // right and the scale bar on the left.
    const stageRect = stage.getBoundingClientRect();
    for (const el of [...zoomButtons, scaleBar]) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      obstacles.push({
        left: r.left - stageRect.left - 4,
        right: r.right - stageRect.left + 4,
        top: r.top - stageRect.top - 4,
        bottom: r.bottom - stageRect.top + 4,
        id: `furniture:${el.getAttribute('data-zoom') || 'scale'}`,
      });
    }

    // Every place has a name ready. Which names are drawn depends on the frame:
    // the names are laid out by the room they have and the revenue they stand
    // for, and the ones with no room are dropped.
    const placed = layoutLabels({
      candidates: candidates.map((c) => ({
        id: c.mark.id,
        x: c.mark.screenX,
        y: c.mark.screenY,
        text: c.text.textContent || '',
        revenue: c.mark.revenue,
      })),
      obstacles,
      measure: (text) => measureLabel(text),
      sheet: { width: size.w, height: size.h },
    });

    for (const candidate of candidates) {
      const { group, mark, text } = candidate;
      const spot = placed.get(mark.id);
      if (!spot) {
        group.setAttribute('hidden', '');
        continue;
      }
      text.setAttribute('x', String(spot.dx));
      text.setAttribute('y', String(spot.dy + 4));
      text.setAttribute('text-anchor', spot.anchor);
    }
  }

  // --- The readout ---------------------------------------------------------
  const fields = {};
  for (const el of readout ? readout.querySelectorAll('[data-readout-field]') : []) {
    fields[el.getAttribute('data-readout-field')] = el;
  }

  function fillReadout(mark) {
    if (!readout || !mark) return;
    const put = (field, value) => {
      if (fields[field]) fields[field].textContent = value;
    };
    put('id', mark.id);
    put('name', mark.name);
    put('ward', mark.ward || '—');
    put('cases', `${Math.round(mark.cases)} a month`);
    put('price', `Rs ${mark.price.toLocaleString('en-IN')}`);
    put('margin', `Rs ${mark.margin.toLocaleString('en-IN')}`);
    put('saturation', `${mark.saturation} / 100`);
    put('travel', `${mark.travelMin} min`);
    put('verdict', mark.verdict);
    put('cluster', mark.cluster);
    readout.dataset.verdict = mark.verdict;
    readout.hidden = false;
  }

  function reasonFor(mark) {
    const el = fields.reason;
    if (!el) return;
    el.textContent =
      mark.verdict === 'GO'
        ? `${mark.cases.toFixed(0)} cases a month, blended price Rs ${mark.price.toLocaleString('en-IN')} against Rs 850 a clustered visit, saturation ${mark.saturation}.`
        : mark.verdict === 'HOLD'
          ? `Holds on volume or margin: ${mark.cases.toFixed(0)} cases a month, Rs ${mark.margin.toLocaleString('en-IN')} a visit over cost, saturation ${mark.saturation}.`
          : `Not worth a stop: ${mark.cases.toFixed(0)} cases a month, Rs ${mark.margin.toLocaleString('en-IN')} a visit over cost.`;
  }

  // --- The callout ---------------------------------------------------------
  function showCallout(mark) {
    if (!callout || !mark) return;
    callout.innerHTML =
      `<span class="map-callout__name">${mark.name}</span>` +
      `<span class="map-callout__figures">${Math.round(mark.cases)} cases a month &middot; Rs ${mark.margin.toLocaleString('en-IN')} margin &middot; ${mark.verdict}</span>`;
    callout.hidden = false;
    const size = stageSize();
    const flip = mark.screenX > size.w - 210;
    callout.classList.toggle('map-callout--flip', flip);
    callout.style.left = `${Math.round(mark.screenX + (flip ? -14 : 14))}px`;
    callout.style.top = `${Math.round(mark.screenY - 18)}px`;
  }

  function hideCallout() {
    if (callout) callout.hidden = true;
  }

  // --- Hover, focus, selection ---------------------------------------------
  function lift(mark, on) {
    if (!mark) return;
    mark.el.classList.toggle('is-lifted', on);
  }

  function show(mark) {
    if (hovered && hovered !== mark) lift(hovered, false);
    hovered = mark;
    if (mark) {
      lift(mark, true);
      showCallout(mark);
      fillReadout(mark);
      reasonFor(mark);
      highlightRoute(mark.cluster);
    } else {
      hideCallout();
      if (selected) fillReadout(selected);
      highlightRoute(selected ? selected.cluster : null);
    }
  }

  // The route a place sits on is the one worth drawing: the other fourteen
  // stay as faint threads until the reader asks for them.
  function highlightRoute(clusterId) {
    for (const path of svg.querySelectorAll('.map-route')) {
      path.classList.toggle('is-active', Boolean(clusterId) && path.getAttribute('data-route') === clusterId);
    }
  }

  function select(mark, writeUrl = true) {
    selected = mark;
    for (const m of marks) {
      const is = m === mark;
      m.el.setAttribute('aria-selected', is ? 'true' : 'false');
      m.el.classList.toggle('is-selected', is);
    }
    if (mark) {
      fillReadout(mark);
      reasonFor(mark);
    }
    if (writeUrl && mark) {
      const url = new URL(window.location.href);
      url.searchParams.set('place', mark.id);
      window.history.replaceState({}, '', url);
    }
  }

  for (const mark of marks) {
    const el = mark.el;
    el.addEventListener('pointerenter', () => show(mark));
    el.addEventListener('pointerleave', () => show(null));
    el.addEventListener('focus', () => show(mark));
    el.addEventListener('blur', () => show(null));
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      select(mark);
      show(mark);
    });
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select(mark);
        show(mark);
        return;
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        // Arrows walk the route the place actually sits on.
        const same = marks.filter((m) => m.cluster === mark.cluster && !m.el.classList.contains('is-clustered'));
        const index = same.indexOf(mark);
        if (index === -1 || same.length < 2) return;
        const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
        const next = same[(index + step + same.length) % same.length];
        event.preventDefault();
        next.el.focus();
        show(next);
        return;
      }
      if (event.key === 'Escape') {
        select(null, false);
        show(null);
      }
    });
  }

  // A cluster zooms in until its places come apart.
  clusterLayer.addEventListener('click', (event) => {
    const group = event.target.closest('.map-cluster');
    if (!group) return;
    const members = (group.getAttribute('data-cluster-members') || '').split(' ').map((id) => markById.get(id)).filter(Boolean);
    if (!members.length) return;
    const cx = members.reduce((sum, m) => sum + m.x, 0) / members.length;
    const cy = members.reduce((sum, m) => sum + m.y, 0) / members.length;
    zoomBy(2.2, { x: cx, y: cy });
  });
  clusterLayer.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const group = event.target.closest('.map-cluster');
    if (!group) return;
    event.preventDefault();
    group.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  // --- Zoom and pan --------------------------------------------------------
  function setView(next) {
    view = next;
    render();
  }

  function zoomBy(factor, focus) {
    const size = stageSize();
    const centre = focus || {
      x: view.x + view.w / 2,
      y: view.y + view.h / 2,
    };
    const nextW = clamp(view.w / factor, full.w / ZOOM_MAX, full.w / ZOOM_MIN);
    const nextH = nextW * (view.h / view.w);
    const ratio = (centre.x - view.x) / view.w;
    const ratioY = (centre.y - view.y) / view.h;
    setView({
      x: centre.x - nextW * ratio,
      y: centre.y - nextH * ratioY,
      w: nextW,
      h: nextH,
    });
  }

  function centreOn(mark, scale) {
    const w = clamp(scale, full.w / ZOOM_MAX, full.w);
    const h = w * (view.h / view.w);
    setView({ x: mark.x - w / 2, y: mark.y - h / 2, w, h });
  }

  for (const button of zoomButtons) {
    button.addEventListener('click', () => {
      const what = button.getAttribute('data-zoom');
      if (what === 'in') zoomBy(1.6);
      else if (what === 'out') zoomBy(1 / 1.6);
      else if (what === 'all') setView(fitAll());
      else setView(fitHome());
    });
  }

  svg.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const rect = stage.getBoundingClientRect();
      const fx = (event.clientX - rect.left) / rect.width;
      const fy = (event.clientY - rect.top) / rect.height;
      zoomBy(event.deltaY < 0 ? 1.18 : 1 / 1.18, {
        x: view.x + view.w * fx,
        y: view.y + view.h * fy,
      });
    },
    { passive: false }
  );

  // Drag to pan. A drag that starts on a mark is a press, not a pan, and a
  // drag that starts on the zoom control is a click the control must keep.
  let dragging = null;
  stage.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.map-place, .map-zoom, button')) return;
    dragging = { x: event.clientX, y: event.clientY, vx: view.x, vy: view.y };
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('is-panning');
  });
  stage.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const size = stageSize();
    const dx = ((event.clientX - dragging.x) / size.w) * view.w;
    const dy = ((event.clientY - dragging.y) / size.h) * view.h;
    setView({ ...view, x: dragging.vx - dx, y: dragging.vy - dy });
  });
  const endDrag = () => {
    dragging = null;
    stage.classList.remove('is-panning');
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('click', (event) => {
    if (event.target.closest('.map-place, .map-cluster')) return;
    select(null, false);
  });

  // --- The sliders ---------------------------------------------------------
  const sliderState = () => {
    const state = {};
    for (const slider of sliders) {
      state[slider.getAttribute('data-slider')] = {
        min: Number(slider.min),
        max: Number(slider.max),
        value: Number(slider.value),
      };
    }
    return state;
  };

  function applyFilters() {
    const state = sliderState();
    const board = getBoard();
    const zone = board ? (board.querySelector('select[data-filter="zone"]') || {}).value || '' : '';
    const verdict = board ? (board.querySelector('select[data-filter="verdict"]') || {}).value || '' : '';
    const tier = board ? (board.querySelector('select[data-filter="tier"]') || {}).value || '' : '';

    let shown = 0;
    for (const mark of marks) {
      let ok = true;
      if (state.cases && mark.cases < state.cases.value) ok = false;
      if (state.price && mark.price < state.price.value) ok = false;
      if (state.margin && mark.margin < state.margin.value) ok = false;
      if (state.saturation && mark.saturation > state.saturation.value) ok = false;
      if (zone && mark.zone !== zone) ok = false;
      if (verdict && mark.verdict !== verdict) ok = false;
      if (tier && mark.tier !== tier) ok = false;
      mark.el.classList.toggle('is-dimmed', !ok);
      if (ok) shown += 1;
      if (mark.el.hasAttribute('data-dimmed') && ok) mark.el.removeAttribute('data-dimmed');
      if (!ok) mark.el.setAttribute('data-dimmed', '');
    }

    for (const el of sliderValues) {
      const key = el.getAttribute('data-slider-value');
      const s = state[key];
      if (!s) continue;
      const unit = key === 'price' || key === 'margin' ? 'Rs ' : '';
      el.textContent =
        key === 'saturation' ? `under ${s.value}` : `${unit}${s.value.toLocaleString('en-IN')}+`;
    }
    if (countEl) countEl.textContent = `${shown} of ${marks.length} places match`;
    return shown;
  }

  for (const slider of sliders) {
    slider.addEventListener('input', () => {
      applyFilters();
    });
    slider.addEventListener('change', () => {
      applyFilters();
    });
  }

  // --- The board ------------------------------------------------------------
  // The board is printed further down the page than the figure, so its
  // controls are not in the document yet. The map listens on the document
  // itself: a change on a filter or a click on a gate both bubble up, and the
  // map answers whichever one it hears.
  function syncWithBoard(event) {
    const target = event.target;
    if (target && target.matches && target.matches('select[data-filter]')) {
      applyFilters();
      return;
    }
    if (target && target.closest && target.closest('#board .gate')) {
      applyFilters();
    }
  }
  document.addEventListener('change', syncWithBoard);
  document.addEventListener('click', syncWithBoard);

  // --- Keyboard on the map ---------------------------------------------------
  svg.addEventListener('keydown', (event) => {
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      zoomBy(1.6);
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      zoomBy(1 / 1.6);
    } else if (event.key === '0') {
      event.preventDefault();
      setView(fitHome());
    }
  });

  // --- Start -----------------------------------------------------------------
  setView(fitHome());
  applyFilters();

  const requested = new URL(window.location.href).searchParams.get('place');
  if (requested) {
    const mark = markById.get(requested);
    if (mark) {
      select(mark, false);
      centreOn(mark, fitHome().w / 6);
      show(mark);
    }
  }

  window.addEventListener('resize', () => render());

  // The panel's own size can change without the window changing: the print
  // twin is laid out at the printed size, and the site may reflow the figure
  // into a narrower column. A resize observer catches both, and the map
  // re-lays its names out at the size it actually has.
  if ('ResizeObserver' in window) {
    let lastW = 0;
    let lastH = 0;
    const observer = new ResizeObserver(() => {
      const size = stageSize();
      if (size.w === lastW && size.h === lastH) return;
      lastW = size.w;
      lastH = size.h;
      render();
    });
    observer.observe(stage);
  }
})();
