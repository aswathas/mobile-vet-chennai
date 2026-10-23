// Harmonises the two research passes into one comparable dataset.
//
// The Zone A pass and the Zone B pass each built a defensible model, but they
// measured veterinary demand in different units and at different city-level
// calibrations. Zone A worked from animals and a 4.0 contacts per pet household
// per year rate. Zone B worked from visits per household per year and
// rescaled its animal rates to a 2,00,000 dog city target. Neither is wrong on
// its own. Side by side they produce a Zone B that looks six times larger than
// Zone A, which is an artefact of the units rather than a fact about the
// corridor.
//
// This script puts both zones on one city-level calibration, states every
// constant, and rescales each locality's demand-linked figures by the same
// factor. Identities, coordinates, competitors, travel, hour curves, weekday
// splits, seasonality and prices are left exactly as the research passes wrote
// them.
//
// Every constant below carries its tier.
//   A = a published figure or a primary document
//   B = arithmetic on tier A inputs
//   C = a modelling assumption

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESEARCH = process.env.MVT_RESEARCH ?? 'research';

// ---- the calibration --------------------------------------------------------

const CALIBRATION = {
  city_households_2026: 1733423, // tier B: census 2011 population 4,621,135 over 4.0
  // persons per household, carried to 2026 on the GCC residential property-tax
  // collection growth from FY2013-14 to FY2017-18 with a decelerating carry.
  city_dogs: 200000, // tier A: the 2,00,000 dog target of the Aug-Oct 2026 GCC
  // campaign. The campaign vaccinated 1,50,303 against it and the June 2026
  // statement puts roughly 1,00,000 dogs microchipped, so 2,00,000 is the
  // corporation's own working figure for dogs present.
  dog_share: 0.62, // tier C: the species mix in both research passes
  cat_share: 0.3,
  // The built-form table. Animals per 100 households, tier C, set so that the
  // household-weighted mean over the two corridors extrapolates over the
  // Corporation to about 192,000 dogs against the GCC's 200,000 target.
  animals_per_100hh: {
    'apartment-cluster': 22,
    residential: 14,
    mixed: 17,
    commercial: 6,
    industrial: 4,
  },
  cases_per_pet_household_year: 4.0, // tier C: the Zone A rate, which
  // reconciles the city frame with the 68,736 active licences and the observed
  // visit mix. Zone B's 15.2 contacts per pet household a year was its own
  // author's note as the assumption most likely to be challenged.
  animals_per_pet_household: {
    'apartment-cluster': 1.45,
    residential: 1.65,
    mixed: 1.55,
    commercial: 1.25,
    industrial: 1.15,
  },
  floor: 1100,
  cost: 850,
};

const FLOOR = CALIBRATION.floor;
const COST = CALIBRATION.cost;

// ---- load -------------------------------------------------------------------

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

const zones = {};
for (const z of ['zone-a', 'zone-b']) {
  const doc = await readJson(join(root, RESEARCH, z, 'localities.json'));
  zones[z] = { doc, list: doc.localities.map((l) => ({ ...l, zone: z === 'zone-a' ? 'A' : 'B' })) };
}

const all = [...zones['zone-a'].list, ...zones['zone-b'].list];

// ---- city-level calibration ------------------------------------------------

// The built-form mix of the two zones, weighted by households. This is the mix
// the corridors present, and it is the best available proxy for the city mix
// because both corridors are residential.
const mix = new Map();
for (const l of all) {
  const t = l.locality_type;
  if (!mix.has(t)) mix.set(t, { households: 0 });
  mix.get(t).households += l.population.households;
}

const totalHouseholds = all.reduce((a, l) => a + l.population.households, 0);
let weightedRate = 0;
for (const [t, m] of mix) {
  weightedRate += (CALIBRATION.animals_per_100hh[t] ?? CALIBRATION.animals_per_100hh.mixed) * m.households;
}
weightedRate /= totalHouseholds;

// The implied city animal base, extrapolated over the Corporation.
const cityAnimals = (weightedRate / 100) * CALIBRATION.city_households_2026;
const cityDogsImplied = cityAnimals * CALIBRATION.dog_share;

const RATES = { ...CALIBRATION.animals_per_100hh };

// ---- per locality -----------------------------------------------------------

const TIER_NOTE =
  'Tier B: recalculated on the dossier calibration, which places both zones on one city-level basis. ' +
  'City animals are set by the Greater Chennai Corporation vaccination campaign of Aug-Oct 2026 ' +
  '(1,50,303 dogs vaccinated against a 2,00,000 target, with roughly 1,00,000 dogs microchipped as a ' +
  `lower bound) spread over ${CALIBRATION.city_households_2026.toLocaleString('en-IN')} households derived from ` +
  'the Census 2011 population of 4,621,135 and the Corporation residential property-tax growth. The ' +
  'built-form table is tier C and set so the two corridors extrapolate to about 192,000 dogs citywide ' +
  'against the Corporation 200,000 target. Veterinary demand is 4.0 contacts per pet household a year, ' +
  'tier C, which is the assumption the Zone B pass named as the one most likely to be challenged.';

function harmonize(l) {
  const type = l.locality_type;
  const rate = RATES[type] ?? RATES.mixed;
  const perPet = CALIBRATION.animals_per_pet_household[type] ?? CALIBRATION.animals_per_pet_household.mixed;

  const animals = (l.population.households * rate) / 100;
  const petHouseholds = animals / perPet;
  const dogs = animals * CALIBRATION.dog_share;
  const cats = animals * CALIBRATION.cat_share;
  const other = animals - dogs - cats;

  const licencePenetration = l.pet_base.license_penetration_pct / 100;
  const oldCases = l.demand.cases_per_month_total || 0;
  const newCases = (petHouseholds * CALIBRATION.cases_per_pet_household_year) / 12;
  const scale = oldCases > 0 ? newCases / oldCases : 0;

  // The tier of a derived figure is the tier of its weakest input. Zone A's
  // household base is modelled from a built-footprint density, so its case
  // counts are tier C even after the recalculation. Zone B's households come
  // from the Census and the property-tax ledger, so its case counts are tier B
  // quantities carrying a tier C rate.
  const demandTier = l.population.tier === 'C' ? 'C' : 'B';

  const out = {
    ...l,
    pet_base: {
      ...l.pet_base,
      pet_households: Math.round(petHouseholds),
      dogs: Math.round(dogs),
      cats: Math.round(cats),
      other_pets: Math.round(other),
      licensed_pets: Math.round(animals * licencePenetration),
      unlicensed_pets: Math.round(animals * (1 - licencePenetration)),
      tier: demandTier,
      basis: TIER_NOTE,
    },
    demand: {
      ...l.demand,
      cases_per_month_total: Number(newCases.toFixed(1)),
      cases_per_week_avg: Number((newCases / 4.33).toFixed(1)),
      peak_cases_per_day: Math.max(1, Math.round(l.demand.peak_cases_per_day * scale)),
      tier: demandTier,
      basis: TIER_NOTE,
    },
  };
  out._old = { cases: oldCases, scale };
  return out;
}

// ---- the route-cluster blended price ---------------------------------------

// The two passes measured "the price a visit earns" on different bases. Zone A
// filled a 156-visit route from one locality alone and let the shortfall fall
// to Rs 699 routine consultations, which is a locality test. Zone B took its
// own mix average, which is a list test. Neither is the thing the market
// report says decides a route, which is the route: four to six localities, one
// vehicle, six visits a day.
//
// So the dossier measures it at the route. The cluster's blended price is the
// demand-weighted mean of the localities' own our-mix demand-pool averages, and
// every locality on that route inherits it. The locality's own fill-diluted
// number is kept beside it, because a locality that cannot contribute much to
// a route is still a weak stop.
function applyClusterPrices(list) {
  const clusters = new Map();
  for (const l of list) {
    const id = l.route_cluster || 'unassigned';
    if (!clusters.has(id)) clusters.set(id, []);
    clusters.get(id).push(l);
  }

  const blends = new Map();
  for (const [id, members] of clusters) {
    const cases = members.reduce((a, m) => a + m.demand.cases_per_month_total, 0);
    const weighted = members.reduce(
      (a, m) => a + m.demand.cases_per_month_total * (m.price.our_mix.avg_visit_price || 0),
      0
    );
    blends.set(id, cases > 0 ? Math.round(weighted / cases) : 0);
  }

  for (const l of list) {
    const id = l.route_cluster || 'unassigned';
    const blend = blends.get(id) || l.price.our_mix.blended_price;

    // One case is one visit for the dossier standard. Zone A's research model
    // counted only the differentiated lines in its revenue and let the rest of
    // the route fill with off-peak consultations; Zone B counted one visit per
    // case. The dossier standardises on one visit per case so the two
    // corridors are comparable, and says so. A chronic caseload really does
    // generate more than one visit a month, so this is the conservative reading
    // for the recurring lines and the generous one for one-off demand.
    const visits = l.demand.cases_per_month_total;

    const monthly = Math.round(visits * blend);
    const weekday = {};
    for (const [d, share] of Object.entries(l.weekday || {})) {
      weekday[d] = Math.round(monthly * share);
    }

    const oneRouteCases = Math.min(Math.round(l.demand.cases_per_month_total), 156);
    const twoRouteCases = Math.min(Math.round(l.demand.cases_per_month_total), 312);

    l.price.our_mix = {
      ...l.price.our_mix,
      blended_price: blend,
      locality_fill_blended_price: l.price.our_mix.blended_price,
      route_cluster_blend: blend,
      basis:
        (l.price.our_mix.basis || '') +
        ' Tier B: the blended price here is the route-cluster blend, the demand-weighted mean of the ' +
        'localities own our-mix demand-pool averages on the same cluster. It is the price a visit earns ' +
        'on the round the locality actually rides. The locality own fill-diluted number is kept beside ' +
        'it as locality_fill_blended_price.',
    };

    l.economics.our_mix = {
      ...l.economics.our_mix,
      revenue_per_visit: blend,
      monthly_revenue_potential: monthly,
      revenue_per_weekday: weekday,
      revenue_per_route_hour: Math.round((blend / 46) * 60),
    };

    const marketScale = l._old.scale;
    const marketMonthly = Math.round((l.economics.market_mix.monthly_revenue_potential || 0) * marketScale);
    const marketWeekday = {};
    for (const [d, share] of Object.entries(l.weekday || {})) {
      marketWeekday[d] = Math.round(marketMonthly * share);
    }
    l.economics.market_mix = {
      ...l.economics.market_mix,
      monthly_revenue_potential: marketMonthly,
      revenue_per_weekday: marketWeekday,
      revenue_per_route_hour: Math.round((l.economics.market_mix.revenue_per_visit / 46) * 60),
    };

    l.economics.serviceable_ceiling = {
      one_route: {
        cases_per_month: oneRouteCases,
        monthly_revenue: Math.round(oneRouteCases * blend),
        contribution: Math.round(oneRouteCases * (blend - CALIBRATION.cost)),
      },
      two_route: {
        cases_per_month: twoRouteCases,
        monthly_revenue: Math.round(twoRouteCases * blend),
        contribution: Math.round(twoRouteCases * (blend - CALIBRATION.cost)),
      },
    };
  }
  return blends;
}

function applyVerdicts(list) {
  const scored = list.map((l) => {
    const price = l.price.our_mix.blended_price;
    const margin = price - COST;
    const cases = l.demand.cases_per_month_total;
    const sat = l.competition.saturation_index;

    let status;
    if (cases < 15 || margin < 100) status = 'NO-GO';
    else if (price >= FLOOR && margin >= 250 && cases >= 40 && sat < 70) status = 'GO';
    else status = 'HOLD';

    return {
      ...l,
      verdict: {
        ...l.verdict,
        status,
        reason:
          `${Math.round(cases)} modelled cases a month from ${l.population.households.toLocaleString('en-IN')} households; ` +
          `our-mix blended price Rs ${Math.round(price).toLocaleString('en-IN')} against a Rs ${COST} cost per clustered visit ` +
          `(margin Rs ${Math.round(margin).toLocaleString('en-IN')}); saturation index ${sat} with ${l.competition.competitor_count} named operators.`,
        confidence: cases >= 40 && price >= FLOOR ? 'medium' : 'low',
      },
    };
  });

  const ranked = scored
    .slice()
    .sort((a, b) => b.economics.our_mix.monthly_revenue_potential - a.economics.our_mix.monthly_revenue_potential);
  const rank = new Map(ranked.map((l, i) => [l.id, i + 1]));
  return scored.map((l) => ({
    ...l,
    verdict: {
      ...l.verdict,
      rank: rank.get(l.id),
      reason: `${l.verdict.reason} Rank ${rank.get(l.id)} of ${scored.length}.`,
    },
  }));
}

// ---- zone summary ----------------------------------------------------------

function rebuildSummary(doc, list) {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, h) => {
    const key = String(h).padStart(2, '0');
    const visits = list.reduce((a, l) => a + (l.demand.cases_per_month_total / 30) * (l.hour_curve[key] || 0), 0);
    return { hour: key, visits: Number(visits.toFixed(2)), staff: visits > 0 ? Math.max(1, Math.ceil(visits / 1.3)) : 0 };
  });

  const clusters = new Map();
  for (const l of list) {
    const id = l.route_cluster || 'unassigned';
    if (!clusters.has(id)) clusters.set(id, []);
    clusters.get(id).push(l);
  }

  const goList = list.filter((l) => l.verdict.status === 'GO').sort((a, b) => a.verdict.rank - b.verdict.rank);
  const noGoList = list.filter((l) => l.verdict.status === 'NO-GO').sort((a, b) => a.verdict.rank - b.verdict.rank);

  return {
    ...(doc.zone_summary || {}),
    locality_count: list.length,
    total_households: list.reduce((a, l) => a + l.population.households, 0),
    total_pet_households: list.reduce((a, l) => a + l.pet_base.pet_households, 0),
    total_licensed: list.reduce((a, l) => a + l.pet_base.licensed_pets, 0),
    total_unlicensed: list.reduce((a, l) => a + l.pet_base.unlicensed_pets, 0),
    total_cases_per_month: Number(list.reduce((a, l) => a + l.demand.cases_per_month_total, 0).toFixed(1)),
    our_mix_monthly_revenue_potential: list.reduce((a, l) => a + l.economics.our_mix.monthly_revenue_potential, 0),
    market_mix_monthly_revenue_potential: list.reduce((a, l) => a + l.economics.market_mix.monthly_revenue_potential, 0),
    top_go_localities: goList.slice(0, 8).map((l) => ({ name: l.name, reason: l.verdict.reason })),
    avoid_localities: noGoList.map((l) => ({ name: l.name, reason: l.verdict.reason })),
    route_clusters: [...clusters.entries()]
      .map(([id, members]) => ({
        id,
        zone: members[0].zone,
        localities: members.map((m) => m.name),
        anchor: members[0].name,
        cases_per_month: Number(members.reduce((a, m) => a + m.demand.cases_per_month_total, 0).toFixed(1)),
        monthly_revenue: members.reduce((a, m) => a + m.economics.our_mix.monthly_revenue_potential, 0),
        contribution: members.reduce((a, m) => a + m.economics.serviceable_ceiling.one_route.contribution, 0),
        notes: members[0].travel?.notes || '',
      }))
      .sort((a, b) => b.monthly_revenue - a.monthly_revenue),
    staffing_by_hour: hours,
    key_caveats: [
      'Every case count, pet base and revenue figure in this file was recalculated on the dossier city-level calibration. The research pass own model is kept beside it in localities.as-researched.json.',
      'Cases are household veterinary demand, not bookings. They are a ceiling to plan against.',
    ],
  };
}

// ---- run --------------------------------------------------------------------

const record = {
  calibration: CALIBRATION,
  weighted_rate_per_100_households: Number(weightedRate.toFixed(3)),
  implied_city_animals: Math.round(cityAnimals),
  implied_city_dogs: Math.round(cityDogsImplied),
  gcc_campaign_target: CALIBRATION.city_dogs,
  rates_per_100_households: RATES,
  zones: {},
};

for (const [z, { doc, list }] of Object.entries(zones)) {
  const staged = list.map(harmonize);
  const blends = applyClusterPrices(staged);
  const harmonized = applyVerdicts(staged).map(({ _old, ...rest }) => rest);
  const before = {
    households: list.reduce((a, l) => a + l.population.households, 0),
    pet_households: list.reduce((a, l) => a + l.pet_base.pet_households, 0),
    cases_per_month: Number(list.reduce((a, l) => a + l.demand.cases_per_month_total, 0).toFixed(1)),
    our_mix_revenue: list.reduce((a, l) => a + l.economics.our_mix.monthly_revenue_potential, 0),
    go: list.filter((l) => l.verdict.status === 'GO').length,
    hold: list.filter((l) => l.verdict.status === 'HOLD').length,
    no_go: list.filter((l) => l.verdict.status === 'NO-GO').length,
  };
  const after = {
    households: harmonized.reduce((a, l) => a + l.population.households, 0),
    pet_households: harmonized.reduce((a, l) => a + l.pet_base.pet_households, 0),
    cases_per_month: Number(harmonized.reduce((a, l) => a + l.demand.cases_per_month_total, 0).toFixed(1)),
    our_mix_revenue: harmonized.reduce((a, l) => a + l.economics.our_mix.monthly_revenue_potential, 0),
    go: harmonized.filter((l) => l.verdict.status === 'GO').length,
    hold: harmonized.filter((l) => l.verdict.status === 'HOLD').length,
    no_go: harmonized.filter((l) => l.verdict.status === 'NO-GO').length,
  };
  record.zones[z] = { before, after, cluster_blends: Object.fromEntries(blends) };

  // Keep the research pass's own output beside the harmonised one.
  await writeFile(
    join(root, RESEARCH, z, 'localities.as-researched.json'),
    JSON.stringify(doc, null, 2) + '\n',
    'utf8'
  );
  await writeFile(
    join(root, RESEARCH, z, 'localities.json'),
    JSON.stringify({ ...doc, localities: harmonized, zone_summary: rebuildSummary(doc, harmonized) }, null, 2) + '\n',
    'utf8'
  );
}

await writeFile(
  join(root, RESEARCH, 'merged', 'calibration.json'),
  JSON.stringify(record, null, 2) + '\n',
  'utf8'
);

console.log(`weighted rate    ${record.weighted_rate_per_100_households} animals per 100 households`);
console.log(`implied city     ${record.implied_city_animals.toLocaleString('en-IN')} animals, ${record.implied_city_dogs.toLocaleString('en-IN')} dogs against a GCC target of ${record.gcc_campaign_target.toLocaleString('en-IN')}`);
console.log('rates            ', JSON.stringify(record.rates_per_100_households));
for (const [z, r] of Object.entries(record.zones)) {
  console.log(`\n${z}`);
  console.log(`  before  pet hh ${r.before.pet_households.toLocaleString('en-IN')}  cases/mo ${r.before.cases_per_month.toLocaleString('en-IN')}  rev Rs ${Math.round(r.before.our_mix_revenue).toLocaleString('en-IN')}  GO ${r.before.go} HOLD ${r.before.hold} NO-GO ${r.before.no_go}`);
  console.log(`  after   pet hh ${r.after.pet_households.toLocaleString('en-IN')}  cases/mo ${r.after.cases_per_month.toLocaleString('en-IN')}  rev Rs ${Math.round(r.after.our_mix_revenue).toLocaleString('en-IN')}  GO ${r.after.go} HOLD ${r.after.hold} NO-GO ${r.after.no_go}`);
}
