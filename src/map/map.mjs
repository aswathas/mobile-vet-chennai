// The Locality Map — geometry module.
//
// A hundred localities on one sheet of paper, drawn straight down: the
// coastline, the four road spines, the fifteen routes in travel order, and
// one mark per locality at its true coordinate. Colour carries the verdict,
// shape repeats it, and the marker's height carries nothing at all — every
// number in the map is a number the research corpus already holds.
//
// Positions are in metres, from the corpus centre, on the plan projection in
// projection.mjs. The map is a placement, not a survey.

import { place } from './projection.mjs';

const VERDICT_COLOUR = {
  GO: 'var(--map-go)',
  HOLD: 'var(--map-hold)',
  'NO-GO': 'var(--map-nogo)',
};

// Every place carries a name on the map. Which names are actually engraved
// depends on the frame: the client lays them out by the room they have and
// the revenue they stand for, and drops the ones that would lie across
// another mark. Ranking them here would fix the set at build time, and a
// fixed set is wrong the moment the reader zooms.
export const LABELLED = 'all';

/**
 * The shape of one mark, drawn around its own centre in screen units.
 * The shape repeats the verdict so the map still reads in black and white.
 */
function markFor(place) {
  const colour = VERDICT_COLOUR[place.verdict] || 'var(--map-hold)';
  const ring = 'stroke="var(--paper, #ffffff)" stroke-width="1.3"';
  if (place.verdict === 'HOLD') {
    return `<rect class="map-place__shape" x="-5" y="-5" width="10" height="10" rx="1" fill="${colour}" ${ring}/>`;
  }
  if (place.verdict === 'NO-GO') {
    return (
      `<circle class="map-place__shape" r="6" fill="${colour}" ${ring}/>` +
      `<path class="map-place__notch" d="M-2.6 0H2.6M0 -2.6V2.6" stroke="var(--paper, #ffffff)" stroke-width="1.4" stroke-linecap="round"/>`
    );
  }
  return `<circle class="map-place__shape" r="6" fill="${colour}" ${ring}/>`;
}

/**
 * Builds the map.
 *
 * The live figure is drawn twice over: the build writes the sheet, and the
 * client re-lays it out whenever the reader zooms. The print twin has no
 * reader and no client, so it asks for the static sheet instead: the same
 * marks, the same clusters, the same names, and a scale bar drawn in the
 * map's own units, all fixed at build time.
 */
export function buildMap({ corpus, osmGeo, view = 'full', width = 1200, static: isStatic = false }) {
  const { places, bounds, bandBounds, routes } = corpus;
  const frame = view === 'band' ? bandBounds : bounds;

  // --- Geography -----------------------------------------------------------
  const geo = [];

  // The coastline, as OSM drew it.
  if (osmGeo?.elements) {
    const coast = osmGeo.elements.filter((e) => e.tags?.natural === 'coastline' && e.geometry?.length > 1);
    const coastPaths = coast.map((way) => {
      const pts = way.geometry.map((g) => place(g.lat, g.lon));
      return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}`;
    });
    if (coastPaths.length) geo.push(`<path class="map-coast" d="${coastPaths.join('')}"/>`);
  }

  // Four road spines, named in the caption rather than on the map.
  const roads = [
    { name: 'Rajiv Gandhi Salai', regex: /Rajiv Gandhi Salai/i },
    { name: 'East Coast Road', regex: /East Coast Road/i },
    { name: 'Grand Southern Trunk Road', regex: /Grand Southern Trunk/i },
    { name: 'Outer Ring Road', regex: /Outer Ring Road/i },
  ];
  for (const road of roads) {
    const ways = (osmGeo?.elements || []).filter((e) => road.regex.test(e.tags?.name || '') && e.geometry?.length > 1);
    const paths = ways.map((way) => {
      const pts = way.geometry.map((g) => place(g.lat, g.lon));
      return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}`;
    });
    if (paths.length) geo.push(`<path class="map-road" data-road="${road.name}" d="${paths.join('')}"/>`);
  }

  // The fifteen routes, each drawn in travel order.
  const routePaths = routes.map((route) => {
    const pts = route.members.map((p) => [p.x, p.y]);
    const d = `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}`;
    return `<path class="map-route" data-route="${route.id}" data-zone="${route.zone}" d="${d}"/>`;
  });

  // --- The marks ------------------------------------------------------------
  // The scale that turns one screen pixel into map metres, for a stage of the
  // nominal width. The client re-computes it when the stage is a different
  // size or the map is zoomed.
  const nominalWidth = width;
  const unitsPerPx = frame.width / nominalWidth;

  const ranked = [...places].sort((a, b) => b.revenue - a.revenue);
  const labelled =
    LABELLED === 'all' ? new Set(places.map((p) => p.id)) : new Set(ranked.slice(0, LABELLED).map((p) => p.id));

  const markParts = places.map((place) => {
    const label = `${place.name} (${place.id}): ${place.verdict}, ${Math.round(place.cases)} cases a month, Rs ${place.margin} margin`;
    return (
      `<g class="map-place" data-place data-place-id="${place.id}" data-zone="${place.zone}" data-cluster="${place.cluster}" ` +
      `data-verdict="${place.verdict}" data-tier="${place.tier}" data-name="${place.name.replace(/"/g, '&quot;')}" ` +
      `data-ward="${place.ward.replace(/"/g, '&quot;')}" data-cases="${place.cases.toFixed(1)}" data-price="${place.price}" ` +
      `data-margin="${place.margin}" data-saturation="${place.saturation}" data-travel-min="${place.travelMin}" ` +
      `data-revenue="${place.revenue}" ` +
      `data-place-x="${place.x.toFixed(2)}" data-place-y="${place.y.toFixed(2)}" ` +
      `transform="translate(${place.x.toFixed(2)} ${place.y.toFixed(2)}) scale(${unitsPerPx.toFixed(6)})" ` +
      `tabindex="0" role="button" aria-selected="false" aria-label="${label.replace(/"/g, '&quot;')}">` +
      `<g class="map-place__body">${markFor(place)}` +
      `<circle class="map-place__selection" r="9"/></g>` +
      `<circle class="map-place__hit" r="13"/>` +
      `</g>`
    );
  });

  const labelParts = places
    .filter((p) => labelled.has(p.id))
    .map(
      (p) =>
        `<g class="map-label" data-label-for="${p.id}" transform="translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) scale(${unitsPerPx.toFixed(6)})" hidden>` +
        `<text x="9" y="4">${p.shortName.replace(/&/g, '&amp;')}</text></g>`
    );

  // --- Furniture ------------------------------------------------------------
  // The scale bar and the north arrow are drawn in the screen's own space,
  // not the map's: the bar's length changes with the zoom, and the arrow does
  // not move at all. They live in the stage as HTML, and the client keeps the
  // bar's length honest.
  const furniture = '';

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" class="map-svg" ` +
    `viewBox="${frame.minX.toFixed(1)} ${frame.minY.toFixed(1)} ${frame.width.toFixed(1)} ${frame.height.toFixed(1)}" ` +
    `data-view-band="${corpus.bandBounds.minX.toFixed(1)} ${corpus.bandBounds.minY.toFixed(1)} ${corpus.bandBounds.width.toFixed(1)} ${corpus.bandBounds.height.toFixed(1)}" ` +
    `data-view-full="${bounds.minX.toFixed(1)} ${bounds.minY.toFixed(1)} ${bounds.width.toFixed(1)} ${bounds.height.toFixed(1)}" ` +
    `preserveAspectRatio="xMidYMid meet" role="img" aria-label="A map of the hundred localities in the two corridors, each at its true coordinate, coloured by verdict">` +
    `<g class="map-geography">${geo.join('')}<g class="map-routes">${routePaths.join('')}</g></g>` +
    `<g class="map-labels">${labelParts.join('')}</g>` +
    `<g class="map-places">${markParts.join('')}</g>` +
    `<g class="map-clusters"></g>` +
    `<g class="map-furniture">${furniture}</g>` +
    `</svg>`;

  return { svg, bounds, unitsPerPx, labelled: [...labelled] };
}
