// The corpus, bound for the map.
//
// One loader for the hundred localities, so the map, the filters, the readout
// and the checks all read the same numbers from the same two research files.
// Nothing here computes a number the corpus does not already carry: every
// field below is either read straight out of the research pass or is the
// verdict rule's own arithmetic on it.

import { place } from './projection.mjs';

export const COST_PER_VISIT = 850; // the dossier's own clustered cost, used by the verdict rule
export const PRICE_FLOOR = 1100; // the dossier's own blended floor

/**
 * Reads one zone's localities and returns the fields the map draws.
 */
function bindZone(localities, zone) {
  return localities.map((loc) => {
    const cases = Number(loc.demand?.cases_per_month_total || 0);
    const price = Math.round(loc.price?.our_mix?.blended_price || 0);
    const cost = Number(loc.economics?.cost_per_visit_clustered || COST_PER_VISIT);
    const margin = price - cost;
    const saturation = Number(loc.competition?.saturation_index || 0);
    const [x, y] = place(loc.lat, loc.lon);

    return {
      id: loc.id,
      name: loc.name,
      shortName: loc.name.split(' (')[0],
      ward: (loc.ward || '').split('(')[0].trim(),
      zone: loc.zone || zone,
      cluster: loc.route_cluster,
      verdict: loc.verdict?.status || 'HOLD',
      verdictReason: loc.verdict?.reason || '',
      rank: Number(loc.verdict?.rank || 0),
      confidence: loc.verdict?.confidence || '',
      cases,
      price,
      margin,
      saturation,
      competitors: Number(loc.competition?.competitor_count || 0),
      travelMin: Number(loc.travel_min_to_hub || 0),
      travelKm: Number(loc.travel_km_to_hub || 0),
      tier: loc.demand?.tier || loc.pet_base?.tier || 'C',
      households: Number(loc.population?.households || 0),
      revenue: Math.round(loc.economics?.our_mix?.monthly_revenue_potential || 0),
      lat: loc.lat,
      lon: loc.lon,
      x,
      y,
    };
  });
}

/**
 * Binds both zones and computes the map's own numbers.
 */
export function bindCorpus(zoneA, zoneB) {
  const places = [...bindZone(zoneA.localities, 'A'), ...bindZone(zoneB.localities, 'B')];

  // The map's extent: every place, with a margin of one tenth of the span.
  const xs = places.map((p) => p.x);
  const ys = places.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const padX = (maxX - minX) * 0.04;
  const padY = (maxY - minY) * 0.04;

  const bounds = {
    minX: minX - padX,
    maxX: maxX + padX,
    minY: minY - padY,
    maxY: maxY + padY,
    width: maxX - minX + padX * 2,
    height: maxY - minY + padY * 2,
  };

  // The corridor: the places that sit in one piece, and the few that stand
  // apart from it. The split is taken from the data rather than a longitude
  // typed in by hand: the places are sorted along the east-west axis and the
  // widest gap in that line is where the corridor ends. Two gaps stand out —
  // one of twenty-three kilometres and one of fourteen — and the two
  // localities west of them are the ones a reader cannot reach by walking.
  const byX = [...places].sort((a, b) => a.x - b.x);
  const gaps = [];
  for (let i = 1; i < byX.length; i += 1) {
    gaps.push({ at: i, width: byX[i].x - byX[i - 1].x });
  }
  gaps.sort((a, b) => b.width - a.width);
  // A gap counts as a break only if it is far wider than the next widest gap
  // and wide enough to be a real distance rather than a street.
  const widest = gaps[0];
  const second = gaps[1];
  const isBreak = widest.width > 8000 && widest.width > second.width * 1.5;
  const band = isBreak ? byX.slice(widest.at) : byX;
  const remote = isBreak ? byX.slice(0, widest.at) : [];

  const bandBounds = (() => {
    const bxs = band.map((p) => p.x);
    const bys = band.map((p) => p.y);
    const bx0 = Math.min(...bxs);
    const bx1 = Math.max(...bxs);
    const by0 = Math.min(...bys);
    const by1 = Math.max(...bys);
    const px = (bx1 - bx0) * 0.04;
    const py = (by1 - by0) * 0.04;
    return { minX: bx0 - px, maxX: bx1 + px, minY: by0 - py, maxY: by1 + py, width: bx1 - bx0 + px * 2, height: by1 - by0 + py * 2 };
  })();

  // The routes: fifteen clusters, each a list of places in travel order.
  const routes = new Map();
  for (const place of places) {
    if (!routes.has(place.cluster)) routes.set(place.cluster, []);
    routes.get(place.cluster).push(place);
  }
  const routeList = [...routes.entries()].map(([id, members]) => ({
    id,
    zone: members[0].zone,
    members,
    cases: members.reduce((sum, p) => sum + p.cases, 0),
    revenue: members.reduce((sum, p) => sum + p.revenue, 0),
    blend: members.reduce((sum, p) => sum + p.price * p.cases, 0) / (members.reduce((sum, p) => sum + p.cases, 0) || 1),
  }));

  // The slider ranges, taken from the corpus's own numbers so a slider can
  // never reach past the data.
  const range = (key) => {
    const values = places.map((p) => p[key]);
    return { min: Math.floor(Math.min(...values)), max: Math.ceil(Math.max(...values)) };
  };

  return {
    places,
    bounds,
    bandBounds,
    bandIds: new Set(band.map((p) => p.id)),
    remoteIds: new Set(remote.map((p) => p.id)),
    routes: routeList,
    ranges: {
      cases: range('cases'),
      price: range('price'),
      margin: range('margin'),
      saturation: range('saturation'),
    },
    counts: {
      places: places.length,
      go: places.filter((p) => p.verdict === 'GO').length,
      hold: places.filter((p) => p.verdict === 'HOLD').length,
      noGo: places.filter((p) => p.verdict === 'NO-GO').length,
      routes: routeList.length,
    },
  };
}

/**
 * The verdict rule, as the dossier states it, applied to a place. Used by the
 * checks to prove the map's colours match the corpus's own verdicts.
 */
export function verdictOf(place) {
  if (place.cases < 15 || place.margin < 100) return 'NO-GO';
  const passes = place.price >= PRICE_FLOOR && place.margin >= 250 && place.cases >= 40 && place.saturation < 70;
  return passes ? 'GO' : 'HOLD';
}
