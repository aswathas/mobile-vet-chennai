// Checks the claims the dossier prose makes against the dataset it describes.
//
// The prose is written by hand and the data is generated, so the two can drift.
// Every number below is claimed in content/micro-places.md. If the data moves,
// this fails and the sentence has to be rewritten, not the model.
//
// Run: node scripts/check-prose.mjs

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESEARCH = process.env.MVT_RESEARCH ?? 'research';

const inr = (n) => Math.round(n || 0).toLocaleString('en-IN');
const readJson = async (p) => JSON.parse(await readFile(p, 'utf8'));

const zoneA = await readJson(join(root, RESEARCH, 'zone-a', 'localities.json'));
const zoneB = await readJson(join(root, RESEARCH, 'zone-b', 'localities.json'));
const agg = await readJson(join(root, 'src', 'content', 'zones', 'aggregates.json'));
const prose = await readFile(join(root, 'content', 'micro-places.md'), 'utf8');

const A = zoneA.localities;
const B = zoneB.localities;
const all = [...A, ...B];

const sum = (list, pick) => list.reduce((a, l) => a + (pick(l) || 0), 0);
const sumA = (pick) => sum(A, pick);
const sumB = (pick) => sum(B, pick);
const top = (list, pick) =>
  list.slice().sort((a, b) => pick(b) - pick(a))[0];
const byName = (list, name) => list.find((l) => l.name === name);

const casesA = sumA((l) => l.demand.cases_per_month_total);
const casesB = sumB((l) => l.demand.cases_per_month_total);
const casesAll = casesA + casesB;

const petA = sumA((l) => l.pet_base.pet_households);
const petB = sumB((l) => l.pet_base.pet_households);
const householdsA = sumA((l) => l.population.households);
const householdsB = sumB((l) => l.population.households);
const ourA = sumA((l) => l.economics.our_mix.monthly_revenue_potential);
const ourB = sumB((l) => l.economics.our_mix.monthly_revenue_potential);
const marketA = sumA((l) => l.economics.market_mix.monthly_revenue_potential);
const marketB = sumB((l) => l.economics.market_mix.monthly_revenue_potential);

const goAll = all.filter((l) => l.verdict.status === 'GO').length;
const holdAll = all.filter((l) => l.verdict.status === 'HOLD').length;
const noGoAll = all.filter((l) => l.verdict.status === 'NO-GO').length;

const vel = byName(all, 'Velachery main (Vijaya Nagar)');
const med = byName(all, 'Medavakkam Town (Munusamy Nagar)');
const pal = byName(all, 'Pallikaranai (Velachery Main Road, oil mill)');
const thiru = byName(all, 'Thiruvanmiyur V.O.C. Street');

const clusters = agg.city.route_clusters;
const byCluster = (id) => clusters.find((c) => c.id === id);

const peakCover = sum(all, (l) => l.demand.peak_cases_per_day);
const top20 = all
  .slice()
  .sort((a, b) => b.economics.our_mix.monthly_revenue_potential - a.economics.our_mix.monthly_revenue_potential)
  .slice(0, 20)
  .reduce((a, l) => a + l.economics.our_mix.monthly_revenue_potential, 0);
const ourAll = ourA + ourB;

const claims = [
  ['Zone A cases a month', '11,576', inr(casesA)],
  ['Zone B cases a month', '5,007', inr(casesB)],
  ['Both corridors cases a month', '16,583', inr(casesAll)],
  ['Zone A households', '2,71,686', inr(householdsA)],
  ['Zone B households', '1,47,113', inr(householdsB)],
  ['Zone A pet households', '34,728', inr(petA)],
  ['Zone B pet households', '15,017', inr(petB)],
  ['Zone A our-mix revenue a month', '1,50,82,166', inr(ourA)],
  ['Zone B our-mix revenue a month', '73,15,332', inr(ourB)],
  ['Both our-mix revenue a month', '2,23,97,498', inr(ourAll)],
  ['Zone A market revenue a month', '1,09,56,703', inr(marketA)],
  ['Zone B market revenue a month', '47,37,195', inr(marketB)],
  ['GO localities', 'Eighty-two', goAll === 82 ? 'Eighty-two' : String(goAll)],
  ['HOLD localities', 'sixteen', holdAll === 16 ? 'sixteen' : String(holdAll)],
  ['NO-GO localities', 'two', noGoAll === 2 ? 'two' : String(noGoAll)],
  ['Velachery main cases a month', '838', inr(vel.demand.cases_per_month_total)],
  ['Velachery main revenue a month', '10.91 lakh', (vel.economics.our_mix.monthly_revenue_potential / 100000).toFixed(2) + ' lakh'],
  ['Medavakkam Town cases a month', '721', inr(med.demand.cases_per_month_total)],
  ['Medavakkam Town revenue a month', '9.40 lakh', (med.economics.our_mix.monthly_revenue_potential / 100000).toFixed(2) + ' lakh'],
  ['Pallikaranai cases a month', '605', inr(pal.demand.cases_per_month_total)],
  ['Pallikaranai revenue a month', '7.83 lakh', (pal.economics.our_mix.monthly_revenue_potential / 100000).toFixed(2) + ' lakh'],
  ['Velachery main peak cover', '51', String(vel.demand.peak_cases_per_day)],
  ['Thiruvanmiyur peak cover', '27', String(thiru.demand.peak_cases_per_day)],
  ['A-R7 cases a month', '2,600', inr(byCluster('A-R7').cases_per_month)],
  ['A-R5 cases a month', '2,473', inr(byCluster('A-R5').cases_per_month)],
  ['A-R6 cases a month', '1,968', inr(byCluster('A-R6').cases_per_month)],
  ['B-R7 cases a month', '1,323', inr(byCluster('B-R7').cases_per_month)],
  ['A-R7 one-route contribution', '70,668', inr(byCluster('A-R7').one_route_contribution)],
  ['A-R5 one-route contribution', '70,824', inr(byCluster('A-R5').one_route_contribution)],
  ['B-R7 one-route contribution', '91,728', inr(byCluster('B-R7').one_route_contribution)],
  ['Peak cover, whole corpus', '1,225', inr(peakCover)],
  ['Top twenty share of revenue', '46.6', ((top20 / ourAll) * 100).toFixed(1)],
  ['Zone A weekend Saturday', '18.0', (agg.zones[0].weekday.Sat * 100).toFixed(1)],
  ['Zone A weekend Sunday', '18.6', (agg.zones[0].weekday.Sun * 100).toFixed(1)],
  ['Zone B Sunday', '12.9', (agg.zones[1].weekday.Sun * 100).toFixed(1)],
  ['Zone A best month index', '117.8', agg.zones[0].seasonality.Jan.toFixed(1)],
  ['Zone A worst month index', '85.0', agg.zones[0].seasonality.Aug.toFixed(1)],
  ['Zone B best month index', '121.2', agg.zones[1].seasonality.Jan.toFixed(1)],
  ['Zone B worst month index', '79.7', agg.zones[1].seasonality.Jul.toFixed(1)],
];

// The median blended price and the saturation means are zone aggregates the
// prose quotes; they are computed here rather than read from the dataset.
for (const [zi, z] of agg.zones.entries()) {
  const list = all.filter((l) => l.zone === z.zone);
  const prices = list.map((l) => l.price.our_mix.blended_price).sort((a, b) => a - b);
  const med = prices.length % 2 ? prices[(prices.length - 1) / 2] : (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2;
  claims.push([
    `Zone ${z.zone} median blended price`,
    z.zone === 'A' ? '1,304' : '1,440',
    inr(med)
  ]);
  claims.push([
    `Zone ${z.zone} mean saturation`,
    z.zone === 'A' ? '31.8' : '59.6',
    (sum(list, (l) => l.competition.saturation_index) / list.length).toFixed(1)
  ]);
  claims.push([
    `Zone ${z.zone} revenue per route-hour`,
    z.zone === 'A' ? '1,701' : '1,878',
    inr(z.our_revenue_per_route_hour)
  ]);
}

// One route can serve 156 visits a month; fifteen clusters reach 2,340, which
// is 14 percent of the corpus.
const clusterVisits = clusters.length * 156;
claims.push(['Cluster capacity in visits', '2,340', inr(clusterVisits)]);
claims.push([
  'Cluster capacity as a share of demand',
  '14',
  ((clusterVisits / casesAll) * 100).toFixed(0)
]);
if (casesAll / clusterVisits < 6.5 || casesAll / clusterVisits > 7.5) {
  failures++;
  console.log(`MISMATCH  corpus over capacity: data says ${(casesAll / clusterVisits).toFixed(1)} times, the prose says roughly seven`);
} else if (!prose.includes('seven times')) {
  console.log('NOT FOUND corpus over capacity: the prose does not say seven times');
}

let failures = 0;
for (const [label, claimed, actual] of claims) {
  const ok = String(claimed) === String(actual);
  const inProse = prose.includes(String(claimed));
  if (!ok) {
    failures++;
    console.log(`MISMATCH  ${label}: prose says ${claimed}, data says ${actual}`);
  } else if (!inProse) {
    console.log(`NOT FOUND ${label}: value ${actual} is right but the prose does not contain it`);
  }
}

console.log('');
console.log(failures ? `${failures} claim(s) do not match the data` : `all ${claims.length} claims match the data`);
