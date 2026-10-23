// Zone A model + emitter.  See MODEL.md for the formula and calibration write-up.
import { writeFileSync } from 'node:fs';
import { LOCALITIES, OPERATORS, CITYWIDE, HUB } from './master.mjs';

// ---------------------------------------------------------------- constants
const K = {
  // spine-report constants
  ACTIVE_LICENCES: 68736, LICENCES_ISSUED: 78392, NOT_RENEWED: 9656,
  CITY_SPEED_KMH: 19.2,            // 31 min 15 s per 10 km (TomTom 2025)
  CLUSTER_TRAVEL_MIN: 21, SCATTER_TRAVEL_MIN: 37, CLINIC_MIN: 25,
  CLUSTER_KM_PER_VISIT: 6.7, SCATTER_KM_PER_VISIT: 12.0,
  COST_PER_VISIT: 850, BLENDED_FLOOR: 1100,
  ROUTE_CAP: 156, TWO_ROUTE_CAP: 312, WORKDAYS: 26,
  ONE_ROUTE_FIXED: 45150, ONE_ROUTE_VAR: 537.5,       // 129,000 at 156 visits
  TWO_ROUTE_FIXED: 87500, TWO_ROUTE_VAR: 520.83,      // 250,000 at 312 visits
  CIRCUITY: 1.30,
  // city pet frame (tier A / B)
  CITY_DOGS: 100000, CITY_PET_HOUSEHOLDS: 92000,
  DOGS_PER_PET_HH: 1.09, CATS_PER_PET_HH: 0.57, OTHER_PER_PET_HH: 0.22,
  // clinical incidence, cases per animal per year (tier C)
  CASES_PER_DOG_YR: 2.68, CASES_PER_CAT_YR: 1.80, CASES_PER_OTHER_YR: 0.35,
  VACCINE_EVENTS_PER_DOG_YR: 1.05,
  // our-mix capture rates
  CAP_LICENCE_GCC: 0.45, CAP_LICENCE_NON: 0.10,
  CAP_VACC_GCC: 0.18, CAP_VACC_NON: 0.35, CAP_EXTENDED: 0.22,
  PLAN_SHARE: 0.55,               // share of chronic caseload on an annual plan
  // market mix split rules
  SPLIT_ROUTINE: [0.86, 0.10, 0.04],   // home consult, clinic outpatient, hospitalisation
  SPLIT_EXTENDED: [0.80, 0.20],        // extended check-up, diagnostics add-on
  SPLIT_CHRONIC: [0.82, 0.18],
  SPLIT_SENIOR: [0.78, 0.22],
  EXTENDED_SHARE_OF_REMAINING: 0.34,
  // verdict gates (REPAIR.md, Defect 1)
  GO_MIN_CASES: 40, HOLD_MIN_CASES: 15,
  GO_MIN_MARGIN: 250, NO_GO_MIN_MARGIN: 100,
  GO_MAX_SATURATION: 70,
  // Chennai Municipal Corporation 2011 frame, used for the density reconciliation
  // population: Census 2011 ward table (data.opencity.in) summed over Chennai (M Corp.)
  // area: the 174 sq km Corporation extent fixed in 1978 (GCC), before the 2009
  // extension to 426 sq km and 200 divisions
  CMC_2011_POP: 4621135, CMC_2011_AREA_KM2: 174, PERSONS_PER_HH: 3.8
};

const ARCH = {
  dense_apartment: { hh: 4600, petBase: 0.058, sum: [1.06, 1.05], hour: 'apt',  wk: 'apt'  },
  mid_apartment:   { hh: 3300, petBase: 0.050, sum: [1.04, 1.03], hour: 'apt',  wk: 'apt'  },
  mixed_res:       { hh: 2250, petBase: 0.042, sum: [0.97, 0.95], hour: 'res',  wk: 'res'  },
  township:        { hh: 1450, petBase: 0.034, sum: [0.92, 0.88], hour: 'res',  wk: 'res'  },
  industrial:      { hh: 700,  petBase: 0.020, sum: [0.92, 0.88], hour: 'ind',  wk: 'com'  },
  commercial:      { hh: 1100, petBase: 0.030, sum: [0.95, 0.94], hour: 'com',  wk: 'com'  }
};

const BASE_SEASON = { Jan:119, Feb:114, Mar:106, Apr:100, May:93, Jun:91, Jul:87, Aug:85, Sep:90, Oct:97, Nov:106, Dec:112 };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const HOUR_RAW = {
  apt: [0.012,0.008,0.006,0.005,0.006,0.010,0.020,0.032,0.046,0.058,0.068,0.062,0.048,0.044,0.042,0.040,0.040,0.044,0.052,0.056,0.050,0.040,0.028,0.017],
  res: [0.012,0.008,0.006,0.005,0.006,0.009,0.018,0.030,0.045,0.058,0.070,0.066,0.052,0.048,0.046,0.044,0.042,0.040,0.048,0.055,0.052,0.042,0.030,0.018],
  ind: [0.010,0.006,0.005,0.004,0.006,0.014,0.034,0.046,0.052,0.048,0.046,0.044,0.042,0.040,0.040,0.040,0.042,0.046,0.052,0.050,0.044,0.036,0.024,0.013],
  com: [0.010,0.007,0.005,0.004,0.005,0.010,0.016,0.026,0.038,0.054,0.068,0.072,0.070,0.062,0.052,0.046,0.044,0.046,0.050,0.056,0.052,0.044,0.032,0.020]
};

const WEEKDAY = {
  apt: { Mon:0.120, Tue:0.122, Wed:0.124, Thu:0.124, Fri:0.134, Sat:0.184, Sun:0.192 },
  res: { Mon:0.128, Tue:0.130, Wed:0.132, Thu:0.132, Fri:0.140, Sat:0.170, Sun:0.168 },
  com: { Mon:0.134, Tue:0.136, Wed:0.138, Thu:0.138, Fri:0.142, Sat:0.160, Sun:0.152 }
};

const MARKET_LINES = [
  { line:'General home consultation, 30 minutes', price:699  },
  { line:'Extended home check-up with blood panel and written plan', price:1699 },
  { line:'Chronic monitoring visit, pay-as-you-go', price:1199 },
  { line:'Senior wellness bundle with blood panel and vaccine', price:1999 },
  { line:'Vaccination at home, anti-rabies or multi-shot', price:599 },
  { line:'Licence compliance: microchip, anti-rabies shot, licence filing', price:250 },
  { line:'Clinic outpatient consultation', price:800 },
  { line:'Diagnostics add-on: blood panel, radiography, ultrasound', price:1200 },
  { line:'Hospitalisation and day care', price:2500 },
  { line:'At-home end-of-life (euthanasia) with sedation', price:6800 }
];
const HOME_DELIVERABLE = new Set([0,1,2,3,4,5,9]);   // line indices deliverable at home

const OUR_LINES = [
  { line:'Routine home consultation, 30 minutes (off-peak filler only)', price:699,  pri:7 },
  { line:'Extended consultation with home blood panel and written plan', price:1699, pri:4 },
  { line:'Chronic monitoring visit, pay-as-you-go', price:1199, pri:3 },
  { line:'Chronic monitoring under annual plan (bundled)', price:825,  pri:3 },
  { line:'Senior wellness bundle with blood panel and vaccine', price:1999, pri:2 },
  { line:'Vaccination at home', price:899, pri:5 },
  { line:'Licence compliance bundle: microchip, anti-rabies shot, licence filing', price:899, pri:6 },
  { line:'At-home euthanasia with sedation and cremation handling', price:8150, pri:1 }
];

// Gully Tails neighbourhood provider counts (loaded category index) per locality.
const GT_PROVIDERS = {
  A01:1,A02:1,A03:1,A04:1,A13:1,A16:0,A17:3,A18:1,A21:3,A22:3,A23:3,A24:3,A25:0,
  A26:0,A27:0,A28:0,A29:0,A30:4,A31:7,A32:7,A33:3,A34:3,A35:3,A36:3,A37:3,A38:3,
  A39:3,A40:3,A41:3,A42:5,A43:1,A44:0,A45:1,A46:7,A47:3,A48:1,A49:1,A50:1,
  A05:0,A06:0,A07:0,A08:0,A09:0,A10:0,A11:0,A12:0,A14:0,A15:0
};

// ---------------------------------------------------------------- helpers
const r1 = n => Math.round(n * 10) / 10;
const r2 = n => Math.round(n * 100) / 100;
const r4 = n => Math.round(n * 10000) / 10000;
// NSE-style digit grouping: 1,19,999 not 119,999.
const inr = n => {
  const neg = n < 0;
  const s = Math.abs(Math.round(n)).toString();
  if (s.length <= 3) return (neg ? '-' : '') + s;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts = [];
  while (rest.length > 2) { parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
  if (rest.length) parts.unshift(rest);
  return (neg ? '-' : '') + parts.join(',') + ',' + last3;
};
const havKm = (a, b) => {
  const R = 6371, t = Math.PI / 180;
  const dLat = (b.lat - a.lat) * t, dLon = (b.lon - a.lon) * t;
  const h = Math.sin(dLat/2)**2 + Math.cos(a.lat*t) * Math.cos(b.lat*t) * Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const isGcc = L => /Greater Chennai Corporation/.test(L.ward);
const roundTo = (x, n) => { const p = 10 ** n; return Math.round(x * p) / p; };

function normalise(obj, digits = 4) {
  const keys = Object.keys(obj);
  const sum = keys.reduce((s, k) => s + obj[k], 0);
  const out = {};
  for (const k of keys) out[k] = roundTo(obj[k] / sum, digits);
  // repair rounding residual on the largest bucket
  const big = keys.reduce((a, b) => obj[a] >= obj[b] ? a : b);
  const now = keys.reduce((s, k) => s + out[k], 0);
  out[big] = roundTo(out[big] + (1 - now), digits);
  return out;
}

// ---------------------------------------------------------------- per-locality model
const built = [];

for (const L of LOCALITIES) {
  const A = ARCH[L.arch];
  const gcc = isGcc(L);

  // --- households (tier C: modelled footprint x archetype density)
  const households = Math.round(L.area * A.hh);

  // --- pet-owning households (tier B/C: archetype base + affluence slope)
  const petRate = Math.min(0.115, Math.max(0.018, A.petBase + 0.0000045 * (L.rsqft - 6000)));
  const petHouseholds = Math.round(households * petRate);
  const dogs   = Math.round(petHouseholds * K.DOGS_PER_PET_HH);
  const cats   = Math.round(petHouseholds * K.CATS_PER_PET_HH);
  const other  = Math.round(petHouseholds * K.OTHER_PER_PET_HH);
  const pets   = dogs + cats + other;

  // --- licence penetration
  const pen = gcc
    ? { dense_apartment:0.46, mid_apartment:0.42, mixed_res:0.38, township:0.34, industrial:0.28, commercial:0.40 }[L.arch]
    : 0.10;                                  // outside GCC the GCC portal and penalty do not apply
  const licensed = Math.round(pets * pen);
  const unlicensed = pets - licensed;

  // --- market case mix (tier B from the tier-C case counts)
  const M = dogs * K.CASES_PER_DOG_YR + cats * K.CASES_PER_CAT_YR + other * K.CASES_PER_OTHER_YR;
  const chronicCases = M * L.chronic;
  const seniorCases  = M * L.senior;
  const eolCases     = dogs * L.eol;
  const vaccineCases = dogs * K.VACCINE_EVENTS_PER_DOG_YR;
  const licenceCases = licensed;
  const remaining    = Math.max(0, M - chronicCases - seniorCases - eolCases - vaccineCases);
  const extendedCases = remaining * K.EXTENDED_SHARE_OF_REMAINING;
  const routineCases  = remaining - extendedCases;

  const marketShares = new Array(MARKET_LINES.length).fill(0);
  const addShare = (idx, cases) => { marketShares[idx] += cases / M; };
  addShare(0, routineCases * K.SPLIT_ROUTINE[0]);
  addShare(6, routineCases * K.SPLIT_ROUTINE[1]);
  addShare(8, routineCases * K.SPLIT_ROUTINE[2]);
  addShare(1, extendedCases * K.SPLIT_EXTENDED[0]);
  addShare(7, extendedCases * K.SPLIT_EXTENDED[1]);
  addShare(2, chronicCases * K.SPLIT_CHRONIC[0]);
  addShare(7, chronicCases * K.SPLIT_CHRONIC[1]);
  addShare(3, seniorCases * K.SPLIT_SENIOR[0]);
  addShare(7, seniorCases * K.SPLIT_SENIOR[1]);
  addShare(4, Math.max(0, vaccineCases - licenceCases));
  addShare(5, licenceCases);
  addShare(9, eolCases);

  const marketPrice = MARKET_LINES.reduce((s, l, i) => s + l.price * marketShares[i], 0);
  const marketHomeRevenue = MARKET_LINES.reduce((s, l, i) => s + (HOME_DELIVERABLE.has(i) ? l.price * marketShares[i] : 0), 0);

  const marketServiceLines = MARKET_LINES.map((l, i) => ({ line: l.line, price: l.price, share_pct: roundTo(marketShares[i] * 100, 2) }));
  const monthlyMarketRevenue = (M * marketPrice) / 12;

  // --- our mix
  const capLic  = gcc ? K.CAP_LICENCE_GCC  : K.CAP_LICENCE_NON;
  const capVacc = gcc ? K.CAP_VACC_GCC     : K.CAP_VACC_NON;
  const planChronic = chronicCases * K.PLAN_SHARE;
  const payChronic  = chronicCases - planChronic;
  const ourPool = [
    { line:1, visits: extendedCases * K.CAP_EXTENDED },   // extended
    { line:2, visits: payChronic },                        // chronic pay-as-you-go
    { line:3, visits: planChronic },                       // chronic under annual plan
    { line:4, visits: seniorCases },                       // senior bundle
    { line:5, visits: Math.max(0, vaccineCases - licenceCases) * capVacc }, // vaccination at home
    { line:6, visits: licenceCases * capLic },             // licence compliance bundle
    { line:7, visits: eolCases }                           // end of life
  ];
  const ourAnnualVisits = ourPool.reduce((s, p) => s + p.visits, 0);
  const ourAnnualRevenue = ourPool.reduce((s, p) => s + p.visits * OUR_LINES[p.line].price, 0);
  const ourMonthlyVisits = ourAnnualVisits / 12;
  const ourMonthlyRevenue = ourAnnualRevenue / 12;

  // pooled share of our-mix visits (routine is 0 in the demand pool)
  const poolShare = new Array(OUR_LINES.length).fill(0);
  for (const p of ourPool) poolShare[p.line] = ourAnnualVisits > 0 ? p.visits / ourAnnualVisits : 0;
  const ourPricePool = OUR_LINES.reduce((s, l, i) => s + l.price * poolShare[i], 0);

  // route fill: take the highest-margin visits first, fill shortfall with routine @ 699
  const priorityOrder = [7,4,1,2,6,5,3,0];   // line indices by margin priority
  function fillRoute(cap) {
    let taken = 0;
    let revenue = 0;
    const used = new Array(OUR_LINES.length).fill(0);
    for (const li of priorityOrder) {
      const pool = ourPool.find(p => p.line === li);
      const avail = pool ? pool.visits / 12 : 0;
      const take = Math.min(avail, cap - taken);
      if (take <= 0) continue;
      used[li] += take; revenue += take * OUR_LINES[li].price; taken += take;
      if (taken >= cap) break;
    }
    if (taken < cap) {
      const filler = cap - taken;
      used[0] += filler; revenue += filler * OUR_LINES[0].price; taken = cap;
    }
    return { visits: taken, revenue, blended: taken > 0 ? revenue / taken : 0, used };
  }
  const oneRoute = fillRoute(K.ROUTE_CAP);
  const twoRoute = fillRoute(K.TWO_ROUTE_CAP);

  // --- seasonality (tier C, archetype-adjusted)
  // The index is scaled to an average of 100. It must NOT go through normalise(),
  // which divides by the sum: that is a share normaliser for the hour curve and
  // the weekday split, and on an index it collapses every month to the same
  // rounded share and leaves January negative.
  const season = {};
  for (const m of MONTHS) {
    let v = BASE_SEASON[m];
    if (['Mar','Apr','May','Jun'].includes(m)) v *= A.sum[0];
    if (['Jul','Aug','Sep'].includes(m)) v *= A.sum[1];
    season[m] = v;
  }
  const rawSeasonMean = MONTHS.reduce((s, m) => s + season[m], 0) / 12;
  const seasonNorm = {};
  for (const m of MONTHS) seasonNorm[m] = roundTo(season[m] * (100 / rawSeasonMean), 1);
  const peakIndex = Math.max(...MONTHS.map(m => seasonNorm[m]));

  // --- hour curve (tier C)
  const hourRaw = HOUR_RAW[A.hour];
  const hour = {};
  for (let h = 0; h < 24; h++) hour[String(h).padStart(2, '0')] = hourRaw[h];
  const hourNorm = normalise(hour, 4);
  let bestStart = 0, bestSum = -1;
  for (let h = 0; h < 22; h++) {
    const s = hourNorm[String(h).padStart(2,'0')] + hourNorm[String(h+1).padStart(2,'0')] + hourNorm[String(h+2).padStart(2,'0')];
    if (s > bestSum) { bestSum = s; bestStart = h; }
  }
  const peakWindow = { start: `${String(bestStart).padStart(2,'0')}:00`, end: `${String(bestStart + 3).padStart(2,'0')}:00` };

  // --- weekday (tier C)
  const weekday = { ...WEEKDAY[A.wk] };
  const wkAvg = ['Mon','Tue','Wed','Thu','Fri'].reduce((s, d) => s + weekday[d], 0) / 5;
  const weekendUplift = roundTo((((weekday.Sat + weekday.Sun) / 2) / wkAvg - 1) * 100, 1);

  // --- demand
  const casesPerMonth = M / 12;
  const casesPerWeek = casesPerMonth / 4.345;
  const peakCasesPerDay = Math.max(1, Math.round((casesPerMonth / 30) * (peakIndex / 100) * 1.6));

  // --- travel
  const hubKm = r1(havKm(HUB, L) * K.CIRCUITY);
  const hubMin = Math.round((hubKm / K.CITY_SPEED_KMH) * 60);
  const clusterMates = LOCALITIES.filter(x => x.cluster === L.cluster && x.id !== L.id);
  let nearestKm = Infinity, nearestName = '';
  for (const m of clusterMates) { const d = havKm(L, m); if (d < nearestKm) { nearestKm = d; nearestName = m.name; } }
  const interTravelMin = Math.max(1, Math.round((nearestKm * K.CIRCUITY / K.CITY_SPEED_KMH) * 60));
  const scattered = nearestKm > 8;
  const travelMinPerVisit = scattered ? K.SCATTER_TRAVEL_MIN : K.CLUSTER_TRAVEL_MIN;
  const routeHoursPerVisit = (travelMinPerVisit + K.CLINIC_MIN) / 60;

  // --- cluster assets
  const assoc = L.arch === 'industrial' ? 0
    : L.arch === 'mixed_res' || L.arch === 'township' ? Math.round(L.complex * 0.2)
    : Math.min(8, Math.round(L.complex * 0.4));
  const gated = L.gated !== null && L.gated !== undefined ? L.gated
    : (L.arch === 'dense_apartment' || L.arch === 'mid_apartment' ? Math.max(0, Math.round(L.listings ? L.listings * 0.6 : 0)) : 0);

  const servicesPerTrip = Math.min(7, Math.max(1, Math.round(0.9 + 0.16 * L.complex + 0.35 * assoc)));

  // --- competition
  const named = [];
  const addOp = (key, local) => {
    const o = OPERATORS[key];
    if (!o) return;
    named.push({
      name: o.name, type: o.type,
      price_observed: o.price > 0 ? o.price : null,
      rating: o.rating > 0 ? o.rating : null,
      reviews: o.reviews > 0 ? o.reviews : null,
      url: o.url, tier: o.tier
    });
  };
  const localOps = L.comp.slice();
  for (const k of localOps) addOp(k);
  const localCount = named.length;
  for (const k of CITYWIDE) {
    if (k === 'little_angels') {
      const cov = /Tambaram|Chrompet|Velachery|Pallikaranai|Perungudi|Navallur|OMR|Chromepet|Porur|Adyar|Kelambakkam|Siruseri|Sholinganallur/.test(
        (L.aliases.join(' ') + ' ' + L.name));
      if (!cov) continue;
    }
    addOp(k);
  }
  if (L.comp.includes('gcc_meenambakkam') || L.id === 'A25' || L.id === 'A29' || L.id === 'A47' || L.id === 'A26' || L.id === 'A27' || L.id === 'A28' || L.id === 'A32' || L.id === 'A46' || L.id === 'A31') {
    if (!named.find(n => n.name.includes('Meenambakkam'))) addOp('gcc_meenambakkam');
  }
  if (['A39','A42','A44','A45','A49','A50','A46','A47'].includes(L.id)) {
    if (!named.find(n => n.name.includes('Blue Cross'))) addOp('blue_cross');
  }
  if (['A04','A25','A30','A33','A34','A35','A36','A37'].includes(L.id) && !named.find(n => n.name.startsWith('Perungudi'))) addOp('perungudi_vet');
  if (['A01','A02','A03','A13','A14','A15'].includes(L.id) && !named.find(n => n.name.startsWith('Saidapet'))) addOp('saidapet_vet');

  const W = { house:12, 'clinic-home-arm':9, platform:4, 'corporate-mobile':12, 'public-ngo':7 };
  let sat = named.reduce((s, n) => s + (W[n.type] ?? 8), 0);
  const gt = GT_PROVIDERS[L.id] ?? 0;
  sat += Math.max(0, gt - localCount) * 4;
  sat = Math.min(100, Math.round(sat));

  // --- economics
  const revPerVisitMarket = marketPrice;
  const revPerVisitOur = oneRoute.blended;
  const rpWhMarket = d => roundTo(monthlyMarketRevenue * weekday[d], 0);
  const rpWhOur = d => roundTo(ourMonthlyRevenue * weekday[d], 0);

  const oneCost = K.ONE_ROUTE_FIXED + K.ONE_ROUTE_VAR * oneRoute.visits;
  const twoCost = K.TWO_ROUTE_FIXED + K.TWO_ROUTE_VAR * twoRoute.visits;
  const oneCases = Math.min(K.ROUTE_CAP, ourMonthlyVisits);
  const twoCases = Math.min(K.TWO_ROUTE_CAP, ourMonthlyVisits);

  // --- verdict (recomputed after cluster aggregation)
  built.push({
    L, A, gcc, households, petRate, petHouseholds, dogs, cats, other, pets, pen,
    licensed, unlicensed, M, chronicCases, seniorCases, eolCases, vaccineCases,
    licenceCases, extendedCases, routineCases,
    marketShares, marketPrice, marketHomeRevenue, marketServiceLines, monthlyMarketRevenue,
    ourPool, ourAnnualVisits, ourAnnualRevenue, ourMonthlyVisits, ourMonthlyRevenue,
    ourPricePool, oneRoute, twoRoute, seasonNorm, peakIndex, hourNorm, peakWindow,
    weekday, weekendUplift, casesPerMonth, casesPerWeek, peakCasesPerDay,
    hubKm, hubMin, nearestKm, nearestName, interTravelMin, scattered, travelMinPerVisit,
    routeHoursPerVisit, assoc, gated, servicesPerTrip, named, localCount, sat,
    revPerVisitMarket, revPerVisitOur, rpWhMarket, rpWhOur,
    oneCost, twoCost, oneCases, twoCases
  });
}

// ---------------------------------------------------------------- cluster aggregation
// A route works a cluster, so the blended price a locality actually earns is the
// realised blend of the whole cluster round, not of the street on its own.
const clusterAgg = {};
for (const b of built) {
  if (!clusterAgg[b.L.cluster]) clusterAgg[b.L.cluster] = { visits: 0, revenue: 0, members: [] };
  const c = clusterAgg[b.L.cluster];
  c.visits += b.ourMonthlyVisits;
  c.revenue += b.ourMonthlyRevenue;
  c.members.push(b);
}
for (const b of built) {
  const c = clusterAgg[b.L.cluster];
  b.clusterBlended = c.visits > 0 ? c.revenue / c.visits : 0;
  b.clusterVisits = c.visits;
  // realised blend for a 156-visit round across the whole cluster, with routine filler
  const pool = [];
  for (const m of c.members) for (const p of m.ourPool) {
    const e = pool.find(x => x.line === p.line);
    if (e) e.visits += p.visits / 12; else pool.push({ line: p.line, visits: p.visits / 12 });
  }
  let taken = 0, rev = 0;
  for (const li of [7,4,1,2,6,5,3,0]) {
    const e = pool.find(x => x.line === li);
    if (!e) continue;
    const take = Math.min(e.visits, K.ROUTE_CAP - taken);
    if (take <= 0) continue;
    rev += take * OUR_LINES[li].price; taken += take;
    if (taken >= K.ROUTE_CAP) break;
  }
  if (taken < K.ROUTE_CAP) { rev += (K.ROUTE_CAP - taken) * OUR_LINES[0].price; taken = K.ROUTE_CAP; }
  b.clusterRouteBlended = taken > 0 ? rev / taken : 0;
  b.clusterRouteRevenue = rev;
}

// ---------------------------------------------------------------- ranks + verdicts
// Rank by prize, not by a composite score. Rank 1 is the biggest prize: the
// largest our-mix monthly revenue potential in the zone. The old composite
// score is gone; REPAIR.md, Defect 1.
const ranked = [...built].sort((a, b) => b.ourMonthlyRevenue - a.ourMonthlyRevenue);
ranked.forEach((b, i) => { b.rank = i + 1; });

for (const b of built) {
  // The locality's realised blended price: one 156-visit route filled from this
  // locality's own our-mix demand pool, any shortfall taken as Rs 699 routine
  // consultations. This is the price the practice actually earns per visit here
  // and it is the number the floor gate reads.
  const blended = b.oneRoute.blended;
  const margin  = blended - K.COST_PER_VISIT;   // margin over the Rs 850 clustered cost
  const cases   = Math.round(b.casesPerMonth);  // demand.cases_per_month_total
  const ops     = b.named.length;               // competition.competitor_count
  const hh      = b.households;

  const gates = {
    price:      blended >= K.BLENDED_FLOOR,
    margin:     margin  >= K.GO_MIN_MARGIN,
    cases:      cases   >= K.GO_MIN_CASES,
    saturation: b.sat   <  K.GO_MAX_SATURATION
  };
  const allPass = gates.price && gates.margin && gates.cases && gates.saturation;

  // NO-GO on a hard failure. HOLD when the cases floor is met but a gate fails.
  let status;
  if (cases < K.HOLD_MIN_CASES || margin < K.NO_GO_MIN_MARGIN) status = 'NO-GO';
  else if (allPass) status = 'GO';
  else status = 'HOLD';

  const facts =
    `Rs ${inr(b.ourMonthlyRevenue)} a month of our-mix revenue potential; ` +
    `${cases} modelled cases a month from ${inr(hh)} households; ` +
    `our-mix blended price Rs ${inr(blended)} against a Rs ${K.COST_PER_VISIT} cost per clustered visit ` +
    `(margin Rs ${inr(margin)}); saturation index ${b.sat} with ${ops} named operators.`;

  const failures = [];
  if (!gates.price) failures.push(`the blended Rs ${inr(blended)} is below the Rs ${inr(K.BLENDED_FLOOR)} floor`);
  if (!gates.margin) failures.push(`the margin of Rs ${inr(margin)} over the Rs ${K.COST_PER_VISIT} clustered cost is short of the Rs ${K.GO_MIN_MARGIN} gate`);
  if (!gates.cases) failures.push(`${cases} cases a month is short of the ${K.GO_MIN_CASES} a month gate`);
  if (!gates.saturation) failures.push(`saturation index ${b.sat} is not below the ${K.GO_MAX_SATURATION} gate`);

  let reason, confidence;
  if (status === 'GO') {
    reason = `${facts} All four gates hold: blended price at or above Rs ${inr(K.BLENDED_FLOOR)}, margin at or above Rs ${K.GO_MIN_MARGIN}, cases at or above ${K.GO_MIN_CASES} a month and saturation index below ${K.GO_MAX_SATURATION}.`;
    const tightest = Math.min(
      blended / K.BLENDED_FLOOR,
      margin / K.GO_MIN_MARGIN,
      cases / K.GO_MIN_CASES,
      (K.GO_MAX_SATURATION - b.sat) / K.GO_MAX_SATURATION
    );
    // A gate cleared by less than 30 percent would flip on the household
    // model's own plus or minus 30 percent band.
    confidence = tightest >= 1.3 ? 'high' : 'medium';
  } else if (status === 'HOLD') {
    reason = `${facts} Not a GO because ${failures.join(' and ')}.`;
    confidence = cases >= K.GO_MIN_CASES ? 'medium' : 'low';
  } else {
    const decisive = [];
    if (cases < K.HOLD_MIN_CASES) decisive.push(`${cases} cases a month is below the ${K.HOLD_MIN_CASES} a month floor`);
    if (blended < K.BLENDED_FLOOR) decisive.push(`the blended Rs ${inr(blended)} is below the Rs ${inr(K.BLENDED_FLOOR)} floor`);
    if (margin < K.NO_GO_MIN_MARGIN) decisive.push(`the margin of Rs ${inr(margin)} over the Rs ${K.COST_PER_VISIT} clustered cost is below the Rs ${K.NO_GO_MIN_MARGIN} minimum`);
    if (b.sat >= K.GO_MAX_SATURATION) decisive.push(`saturation index ${b.sat} is not below the ${K.GO_MAX_SATURATION} gate`);
    reason = `${facts} No-go because ${decisive.join(' and ')}.`;
    confidence = cases >= K.GO_MIN_CASES ? 'medium' : 'low';
  }
  b.verdict = { status, reason, rank: b.rank, confidence };
}

// ---------------------------------------------------------------- zone aggregates
// Computed once, before the per-locality basis strings, so every row states
// the same density arithmetic. REPAIR.md: the population basis used to quote an
// archetype density beside a zone total that could not be reconciled with it.
const zoneArea = roundTo(LOCALITIES.reduce((s, x) => s + x.area, 0), 1);
const zoneHouseholds = built.reduce((s, b) => s + b.households, 0);
const zonePeople = zoneHouseholds * K.PERSONS_PER_HH;
const zoneHhDensity = Math.round(zoneHouseholds / zoneArea);
const zonePeopleDensity = Math.round(zonePeople / zoneArea);
const cmcHhDensity = Math.round(K.CMC_2011_POP / K.PERSONS_PER_HH / K.CMC_2011_AREA_KM2);
const cmcPeopleDensity = Math.round(K.CMC_2011_POP / K.CMC_2011_AREA_KM2);
const cmcSharePct = Math.round(zoneHhDensity / cmcHhDensity * 100);
const archetypeArea = {};
for (const b of built) {
  const a = archetypeArea[b.L.arch] || (archetypeArea[b.L.arch] = { dens: b.A.hh, area: 0, hh: 0, n: 0 });
  a.area += b.L.area; a.hh += b.households; a.n += 1;
}
const archetypeTable = Object.entries(archetypeArea)
  .map(([k, v]) => `${k} ${v.n} localities, ${roundTo(v.area, 1)} km2 at ${inr(v.dens)} per km2 = ${inr(v.hh)} households`)
  .join('; ');
const belowFloor = built.filter(b => b.oneRoute.blended < K.BLENDED_FLOOR).length;
const belowFloorMargin = built.filter(b => b.oneRoute.blended - K.COST_PER_VISIT < K.NO_GO_MIN_MARGIN).length;

// ---------------------------------------------------------------- assemble JSON
const n2 = n => roundTo(n, 2);

const localities = built.map(b => {
  const L = b.L;
  const coordNote = L.coordTier === 'A'
    ? `Coordinate is the OpenStreetMap / Nominatim place record for ${L.name.split('(')[0].trim()}.`
    : `Coordinate is a modelled sub-locality point displaced under 2 km from the OpenStreetMap parent-area record; treat travel times to this locality as accurate only to about 5 minutes.`;
  const adminNote = b.gcc
    ? 'Inside Greater Chennai Corporation limits, so the GCC pet-licence portal, the free microchipping and the Rs 5,000 penalty regime apply.'
    : 'Outside Greater Chennai Corporation limits. The GCC pet-licence portal, the free microchipping, the Rs 5,000 penalty regime and the GCC free pet clinics do not reach this locality.';
  const priceBand = L.rsqft >= 10000 ? 'premium' : L.rsqft >= 7500 ? 'upper-mid' : L.rsqft >= 6000 ? 'mid' : 'value';

  return {
    id: L.id,
    name: L.name,
    aliases: L.aliases,
    ward: L.ward,
    assembly_constituency: L.ac,
    pin_codes: L.pins,
    lat: L.lat,
    lon: L.lon,
    locality_type: L.type,
    travel_km_to_hub: b.hubKm,
    travel_min_to_hub: b.hubMin,
    route_cluster: L.cluster,
    population: {
      households: b.households,
      tier: 'C',
      basis: `Tier C. Modelled built-up footprint of ${L.area} km2 at the ${b.A.hh} households per km2 density for the ${b.L.arch} archetype, which gives ${b.households} households here. The fifty archetype-weighted footprints total ${zoneArea} km2 and carry ${inr(zoneHouseholds)} households, so the zone-wide effective density is ${inr(zoneHhDensity)} households per km2. That ${inr(zoneHhDensity)} is the area-weighted mean of the six archetype densities (${archetypeTable}), not any one of them; the ${inr(b.A.hh)} households per km2 quoted above is this row's archetype parameter and sits ${inr(Math.abs(zoneHhDensity - b.A.hh))} households per km2 ${zoneHhDensity >= b.A.hh ? 'above' : 'below'} the zone mean. At ${K.PERSONS_PER_HH} persons per household the zone is about ${(zonePeople / 1e6).toFixed(2)} million people at ${inr(zonePeopleDensity)} people per km2, which is ${cmcSharePct} percent of the Chennai Municipal Corporation's 2011 density of ${inr(cmcHhDensity)} households per km2 (${inr(cmcPeopleDensity)} people per km2, from ${inr(K.CMC_2011_POP)} people over the ${K.CMC_2011_AREA_KM2} sq km Corporation extent), because the cluster contains large open-layout and industrial tracts. No ward-level Census 2011 household table was retrievable for the post-2021 200-ward structure, so the household base is a footprint times an archetype density and not a census allocation. Uncertainty band plus or minus 30 percent.`
    },
    pet_base: {
      pet_households: b.petHouseholds,
      dogs: b.dogs,
      cats: b.cats,
      other_pets: b.other,
      licensed_pets: b.licensed,
      unlicensed_pets: b.unlicensed,
      license_penetration_pct: n2(b.pen * 100),
      tier: 'C',
      basis: `Tier C. Pet-owning households are ${(b.petRate * 100).toFixed(1)} percent of households, from the archetype base for ${b.L.arch} plus an affluence slope of 0.0045 per rupee of the Rs ${L.rsqft} per sq ft MagicBricks median. Dogs, cats and other pets use 1.09, 0.57 and 0.22 animals per pet household, calibrated so the city frame reconciles with roughly 1 lakh microchipped dogs against 68,736 active licences. Licence penetration of ${(b.pen * 100).toFixed(0)} percent is ${b.gcc ? 'the GCC-internal rate for this archetype' : 'a nominal 10 percent because the locality sits outside Greater Chennai Corporation limits, so the GCC portal, free microchipping and the Rs 5,000 penalty do not apply here and the licence-compliance wedge is largely unavailable'}.`
    },
    demand: {
      cases_per_month_total: Math.round(b.casesPerMonth),
      cases_per_week_avg: r1(b.casesPerWeek),
      peak_cases_per_day: b.peakCasesPerDay,
      peak_cover_definition: 'Maximum plausible veterinary cases in this locality on a single day at the seasonal peak, set as the annual-average month divided by 30, multiplied by the highest monthly seasonality index, multiplied by a 1.6 single-day concentration factor for weekend and association-round clustering. It is a demand ceiling, not serviceable capacity; the serviceable ceiling is reported separately under economics.serviceable_ceiling.',
      tier: 'C',
      basis: `Tier C. Annual cases = ${b.dogs} dogs at 2.68 cases each a year, ${b.cats} cats at 1.80 and ${b.other} other pets at 0.35, giving ${Math.round(b.M)} a year or ${Math.round(b.casesPerMonth)} in an average month. The case rates are modelled; they reconcile with 4.0 veterinary contacts per pet household a year, which is the ratio that keeps the city frame consistent with 68,736 active licences against about 1 lakh microchipped dogs.`
    },
    seasonality: {
      index: b.seasonNorm,
      basis: `Tier C. Chennai pattern with 119 in January and February for post-campaign renewal demand in the best weather, a heat trough at 91 in June, a monsoon trough at 85 in August, then recovery through the October to December GCC campaign window, which the spine report treats as acquisition rather than revenue months. The ${b.L.arch} archetype then shifts March to June by ${b.A.sum[0]} and July to September by ${b.A.sum[1]} before the index is renormalised to an average of 100, which is how a covered-lobby apartment cluster tolerates a summer visit that an open-layout locality does not.`
    },
    weekday: b.weekday,
    weekend_uplift_pct: b.weekendUplift,
    hour_curve: b.hourNorm,
    peak_window: b.peakWindow,
    price: {
      market_mix: {
        avg_visit_price: Math.round(b.marketPrice),
        service_lines: b.marketServiceLines,
        monthly_spend_per_customer: Math.round((b.M * b.marketPrice) / Math.max(1, b.petHouseholds) / 12),
        tier: 'C',
        basis: `Tier C mix on tier A prices. Line prices are the spine report's observed ladder (home consult Rs 599 to Rs 999, extended home check-up with blood panel Rs 1,699, senior check-up Rs 1,999, home euthanasia Rs 6,800 median) and the clinic-side prices published on Lybrate (Rs 100 to Rs 800) and the GCC free centre. Shares are derived from this locality's own case mix, so the mix moves with the chronic, senior and end-of-life density of the neighbourhood. The blended market price of Rs ${Math.round(b.marketPrice)} per veterinary case sits below the Rs 1,100 house-call cost floor, which is the spine report's central finding.`
      },
      our_mix: {
        avg_visit_price: Math.round(b.ourPricePool),
        blended_price: Math.round(b.oneRoute.blended),
        service_lines: (() => {
          const tot = b.ourAnnualVisits > 0 ? b.ourAnnualVisits : 1;
          const arr = OUR_LINES.map((l, i) => {
            const pool = b.ourPool.filter(p => p.line === i).reduce((a, p) => a + p.visits, 0);
            return { line: l.line, price: l.price, share_pct: n2((pool / tot) * 100) };
          });
          const s = arr.reduce((a, x) => a + x.share_pct, 0);
          const big = arr.reduce((a, x) => x.share_pct > a.share_pct ? x : a);
          big.share_pct = n2(big.share_pct + (100 - s));
          return arr;
        })(),
        monthly_spend_per_customer: Math.round((b.ourAnnualRevenue) / Math.max(1, b.petHouseholds) / 12),
        tier: 'C',
        basis: `Tier C mix on tier A prices from the spine report's price list. avg_visit_price is the weighted average of this locality's own addressable our-mix demand pool with no routine consultation in it, so it is the value mix of this street's demand. blended_price is the number the verdict rule reads in this research file: what one ${K.ROUTE_CAP}-visit route realises per visit when it is filled from this locality's own our-mix demand pool, with any shortfall taken as routine consultations at Rs 699 as off-peak filler; that is why it can fall well below avg_visit_price where the locality's own demand will not fill a route on its own. The ${b.L.cluster} round as a whole, pooling every locality in the cluster, realises Rs ${inr(Math.round(b.clusterRouteBlended))} a visit, which is the price a visit earns on the round this locality actually rides, so a shortfall here is a route-density problem in this locality rather than a cluster-wide one. Plan mix is set at ${(K.PLAN_SHARE * 100).toFixed(0)} percent of the chronic caseload.`
      }
    },
    economics: {
      market_mix: {
        monthly_revenue_potential: Math.round(b.monthlyMarketRevenue),
        revenue_per_visit: Math.round(b.revPerVisitMarket),
        revenue_per_weekday: Object.fromEntries(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => [d, b.rpWhMarket(d)])),
        revenue_per_route_hour: Math.round((b.marketHomeRevenue / b.routeHoursPerVisit))
      },
      our_mix: {
        monthly_revenue_potential: Math.round(b.ourMonthlyRevenue),
        revenue_per_visit: Math.round(b.ourPricePool),
        revenue_per_weekday: Object.fromEntries(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => [d, b.rpWhOur(d)])),
        revenue_per_route_hour: Math.round(b.oneRoute.blended / b.routeHoursPerVisit)
      },
      serviceable_ceiling: {
        one_route: {
          cases_per_month: Math.round(b.oneCases),
          monthly_revenue: Math.round(b.oneCases * b.ourPricePool),
          contribution: Math.round(b.oneCases * b.ourPricePool - b.oneCost)
        },
        two_route: {
          cases_per_month: Math.round(b.twoCases),
          monthly_revenue: Math.round(b.twoCases * b.ourPricePool),
          contribution: Math.round(b.twoCases * b.ourPricePool - b.twoCost)
        }
      },
      cost_per_visit_clustered: 850,
      blended_floor: 1100
    },
    competition: {
      competitor_count: b.named.length,
      saturation_index: b.sat,
      named: b.named
    },
    cluster_assets: {
      apartment_complexes: L.complex,
      gated_communities: b.gated,
      pet_friendly_associations: b.assoc,
      notable_clusters: L.notable,
      tier: L.gated !== null && L.gated !== undefined ? 'A' : 'C',
      basis: `apartment_complexes is the count of distinct named projects on the loaded MagicBricks and 99acres locality pages${L.listings !== null ? `, against ${L.listings} flats listed on the same page` : ', with no dedicated locality listing page so the parent-locality count is used as a proxy'}. gated_communities is the 99acres gated-community project count where one was loaded${L.gated !== null ? ` (${L.gated})` : ' and otherwise modelled from the listed-flat count'}. Known unit counts from loaded project pages total ${L.units} units here. pet_friendly_associations is modelled at ${b.assoc} because no association register for this cluster was published on any page loaded.`
    },
    travel: {
      inter_locality_travel_min: b.interTravelMin,
      services_per_trip_possible: b.servicesPerTrip,
      scattered_or_clustered: b.scattered ? 'scattered' : 'clustered',
      notes: `${coordNote} Straight line to the hub is ${r1(havKm(HUB, L))} km, ${b.hubKm} km by road at a 1.30 circuity factor, which is ${b.hubMin} minutes at the ${K.CITY_SPEED_KMH} km per hour city average from the TomTom 2025 index. Nearest route-cluster neighbour is ${b.nearestName} at ${r1(b.nearestKm)} km. ${b.scattered ? 'The nearest cluster neighbour is more than 8 km away, so the scattered figure of 37 minutes of travel per 25 minutes of clinical work is used instead of the clustered 21 minutes.' : 'The clustered figure of 21 minutes of travel per 25 minutes of clinical work, 6.7 km per visit, is used.'} ${adminNote}`
    },
    verdict: b.verdict
  };
});

// ---------------------------------------------------------------- zone summary
// zoneHouseholds is computed in the zone-aggregates block above.
const zonePetHH = built.reduce((s, b) => s + b.petHouseholds, 0);
const zoneCases = built.reduce((s, b) => s + b.casesPerMonth, 0);
const zoneOurRevenue = built.reduce((s, b) => s + b.ourMonthlyRevenue, 0);
const zoneMarketRevenue = built.reduce((s, b) => s + b.monthlyMarketRevenue, 0);
const zoneGcc = built.filter(b => b.gcc).length;

const clusterSummary = Object.entries(
  built.reduce((m, b) => {
    if (!m[b.L.cluster]) m[b.L.cluster] = { cases: 0, rev: 0, members: [] };
    m[b.L.cluster].cases += b.casesPerMonth;
    m[b.L.cluster].rev += b.ourMonthlyRevenue;
    m[b.L.cluster].members.push(b.L.id);
    return m;
  }, {})
).sort((a, b2) => a[0].localeCompare(b2[0])).map(([id, v]) => {
  const anchors = { 'A-R1':'Tambaram East (A02)', 'A-R2':'Mangadu Town (A07)', 'A-R3':'Selaiyur (A13)', 'A-R4':'Chromepet RP Road (A21)', 'A-R5':'Medavakkam Town (A25)', 'A-R6':'Pallikaranai oil mill (A33)', 'A-R7':'Velachery Vijaya Nagar (A39)', 'A-R8':'Thoraipakkam (A50)' };
  const members = v.members;
  const spread = r1(Math.max(...members.map(m => {
    const L = LOCALITIES.find(x => x.id === m);
    return havKm(L, LOCALITIES.find(x => x.id === anchors[id].match(/\((A\d\d)\)/)[1]));
  })));
  return {
    id, localities: members, anchor: anchors[id],
    cases_per_month: Math.round(v.cases), monthly_revenue: Math.round(v.rev),
    notes: `${members.length} localities, ${spread} km maximum radius from the anchor, ${v.members.filter(m => LOCALITIES.find(x => x.id === m).id !== 'A11' && LOCALITIES.find(x => x.id === m).id !== 'A12').length} of them inside Greater Chennai Corporation limits.`
  };
});

const staffing = [];
for (let h = 10; h <= 16; h++) {
  const share = built.reduce((s, b) => s + b.hourNorm[String(h).padStart(2, '0')], 0) / built.length;
  const visits = Math.round((zoneCases / 30) * share);
  staffing.push({ hour: String(h).padStart(2, '0'), visits, staff: visits >= 60 ? 2 : 1 });
}

const out = {
  zone: 'A',
  zone_name: 'South-East cluster',
  hub: {
    name: HUB.name, lat: HUB.lat, lon: HUB.lon,
    rationale: `Velachery is the only point in the cluster where three named veterinary operators sit inside the locality itself (Sanchu Animal Hospital 4.4 across 1,217 reviews, Auro Multi Specialty Pet Hospital 4.1 across 622, AURO PET CLINIC at Rs 350) with two more within 1.5 km (Thanigai Pet Care Hospital 4.6 across 967, K K Pet Clinic 4.5 across 809). It also carries the densest housing inventory in the cluster, 310 gated-community projects on 99acres and 2,527 housing.com listings, and it sits inside Greater Chennai Corporation Zone 13, so the pet-licence workflow the spine report treats as the commercial hook is live there and not in the outer townships.`
  },
  generated_note: `Built ${new Date().toISOString().slice(0, 10)} from the spine report, the Greater Chennai Corporation veterinary pages, OpenStreetMap geocoding, Justdial, Lybrate, Gully Tails, Little Angels, MagicBricks, 99acres, SquareYards, chennaigatedcommunity.in and propspedia. Convention: a null in competition.named means the operator published no price, rating or review count on the page that was loaded; the Greater Chennai Corporation Meenambakkam centre is the only operator with a genuinely zero price and it is shown as 0. Coordinates are OpenStreetMap place records unless the locality note says otherwise, in which case the point is a modelled sub-locality displacement.`,
  localities,
  zone_summary: {
    locality_count: localities.length,
    total_households: zoneHouseholds,
    total_pet_households: zonePetHH,
    total_cases_per_month: localities.reduce((s, l) => s + l.demand.cases_per_month_total, 0),
    our_mix_monthly_revenue_potential: localities.reduce((s, l) => s + l.economics.our_mix.monthly_revenue_potential, 0),
    top_go_localities: ranked.filter(b => b.verdict.status === 'GO').slice(0, 8).map(b => ({
      name: b.L.name,
      reason: b.verdict.reason
    })),
    avoid_localities: ranked.filter(b => b.verdict.status === 'NO-GO').map(b => ({
      name: b.L.name,
      reason: b.verdict.reason
    })),
    route_clusters: clusterSummary,
    staffing_by_hour: staffing,
    key_caveats: [
      `Jurisdiction splits the cluster in half: ${zoneGcc} of 50 localities sit inside Greater Chennai Corporation limits and ${50 - zoneGcc} sit in Tambaram City Municipal Corporation or in Chengalpattu and Kanchipuram district panchayats. The GCC pet-licence portal, free microchipping, the Rs 5,000 penalty from 16 June 2026 and the GCC free pet clinics do not reach the outer ${50 - zoneGcc} localities, so the licence-compliance wedge that the spine report treats as the acquisition engine is available in only ${zoneGcc} of the 50 addresses in this dataset.`,
      `Only one GCC free pet clinic and ABC centre sits inside the cluster at all: Meenambakkam, No.53/28 B Nehru High Road, B V Nagar, Nanganallur 600061, open 8:00 to 15:00. The other five free pet clinics and four of the five ABC centres are 12 to 20 km north of the Zone A footprint.`,
      `Household and demand figures are tier C throughout. No ward-level Census 2011 household table was retrievable for the post-2021 200-ward GCC structure, so the household base is a modelled footprint times an archetype density. The fifty archetype-weighted footprints total ${zoneArea} km2 and carry ${inr(zoneHouseholds)} households, a zone-wide effective density of ${inr(zoneHhDensity)} households per km2, which is the area-weighted mean of the six archetype densities and not any single one of them; a row quoting 1,450 households per km2 is quoting the township archetype parameter for that row alone. At ${K.PERSONS_PER_HH} persons per household the cluster is about ${(zonePeople / 1e6).toFixed(2)} million people at ${inr(zonePeopleDensity)} people per km2, ${cmcSharePct} percent of the Chennai Municipal Corporation's 2011 density of ${inr(cmcHhDensity)} households per km2 over the ${K.CMC_2011_AREA_KM2} sq km Corporation extent.`,
      `The verdict gate reads the blended price a single ${K.ROUTE_CAP}-visit route realises from a locality's own demand, so a locality whose own demand will not fill a route is diluted by Rs 699 routine filler and can fall under the Rs ${inr(K.BLENDED_FLOOR)} floor even when its cluster is strong. ${belowFloor} of the 50 localities sit below the floor on that measure and ${belowFloorMargin} of them also fail the Rs ${K.NO_GO_MIN_MARGIN} minimum margin over the Rs ${K.COST_PER_VISIT} clustered cost. The cluster round blend, pooling every locality in a route cluster, is a higher number for the same cluster and is carried in the price.our_mix basis text.`,
      `Affluence uses the MagicBricks median Rs per sq ft of the listed flats for the locality, with propspedia as a cross-check. propspedia samples are 1 to 17 listings and MagicBricks samples 14 to 39, so both are noisy. Pammal at Rs 7,500 on the MagicBricks median against Rs 25,050 on propspedia is the widest gap in the set.`,
      `The competition picture is a floor, not a census. Justdial served full listing data for only its first three requests per address before soft-blocking, and Gully Tails indexes 284 Chennai clinics of which one page loaded. ${built.filter(b => b.localCount === 0).length} of the 50 localities returned no operator named from their own page and carry only the citywide names, which means "not found in the sources that loaded", not confirmed absence.`,
      `Rent per sq ft was not found on any site that loaded. The affluence axis therefore rests entirely on sale prices, which biases the cluster towards owner-occupied and understates renter-constrained localities.`,
      `The Parandur airport corridor is 52.6 km straight line from the hub with a published inventory of 9-plus properties at Rs 6.1 lakh to Rs 27 lakh and an average of Rs 2,469 per sq ft. It is a pre-build land market, not a completed community, and it is not a drivable daily route from Velachery.`,
      `Total addressable our-mix revenue for the whole cluster is Rs ${inr(Math.round(zoneOurRevenue))} a month against a total market of Rs ${inr(Math.round(zoneMarketRevenue))}. One route carries 156 visits, so the cluster is far larger than one route but far smaller than a citywide service, which is exactly the shape the spine report's two-or-three-contiguous-micro-zone instruction assumes.`
    ]
  }
};

writeFileSync(
  new URL('../localities.json', import.meta.url),
  JSON.stringify(out, null, 2) + '\n',
  'utf8'
);

console.log('localities:', localities.length);
console.log('zone households:', zoneHouseholds);
console.log('zone pet households:', zonePetHH);
console.log('zone cases/month:', Math.round(zoneCases));
console.log('zone our-mix monthly revenue:', Math.round(zoneOurRevenue));
console.log('zone market monthly revenue:', Math.round(zoneMarketRevenue));
console.log('zone our-mix addressable visits/month:', Math.round(built.reduce((s, b) => s + b.ourMonthlyVisits, 0)));
console.log('GCC-internal localities:', built.filter(b => b.gcc).length);
console.log('status counts:', JSON.stringify(localities.reduce((m, l) => { m[l.verdict.status] = (m[l.verdict.status] || 0) + 1; return m; }, {})));
console.log('hour curve sums (max dev):', Math.max(...localities.map(l => Math.abs(Object.values(l.hour_curve).reduce((a, b) => a + b, 0) - 1))));
console.log('weekday sums (max dev):', Math.max(...localities.map(l => Math.abs(Object.values(l.weekday).reduce((a, b) => a + b, 0) - 1))));
console.log('season mean (max dev):', Math.max(...localities.map(l => Math.abs(Object.values(l.seasonality.index).reduce((a, b) => a + b, 0) / 12 - 100))));
const slDev = Math.max(...localities.flatMap(l => [l.price.market_mix.service_lines, l.price.our_mix.service_lines].map(s => Math.abs(s.reduce((a, x) => a + x.share_pct, 0) - 100))));
console.log('service_line share sums (max dev):', slDev);
console.log('top 10:', ranked.slice(0, 10).map(b => `${b.L.id} ${b.L.name} ${b.verdict.status} blended=${Math.round(b.oneRoute.blended)} margin=${Math.round(b.oneRoute.blended - K.COST_PER_VISIT)} cases=${Math.round(b.casesPerMonth)} sat=${b.sat} rev=${Math.round(b.ourMonthlyRevenue)}`).join(' | '));
console.log('bottom 8:', ranked.slice(-8).reverse().map(b => `${b.L.id} ${b.L.name} ${b.verdict.status} blended=${Math.round(b.oneRoute.blended)} rev=${Math.round(b.ourMonthlyRevenue)}`).join(' | '));
console.log('cluster round blends:', Object.entries(clusterAgg).map(([k, v]) => `${k}=${Math.round(v.revenue / v.visits)} (${Math.round(v.visits)} visits/mth)`).join(' '));
console.log('below the Rs 1,100 floor:', belowFloor, '| below the Rs 100 margin minimum:', belowFloorMargin);
console.log('density: area', zoneArea, 'km2 | households', zoneHouseholds, '| effective', zoneHhDensity, 'hh/km2 | CMC', cmcHhDensity, 'hh/km2 |', cmcSharePct, 'percent');
console.log('archetypes:', archetypeTable);
console.log('summary reason strings match rows:', localities.every(l => {
  const t = out.zone_summary.top_go_localities.find(x => x.name === l.name);
  const a = out.zone_summary.avoid_localities.find(x => x.name === l.name);
  return (t ? t.reason === l.verdict.reason : true) && (a ? a.reason === l.verdict.reason : true);
}));
