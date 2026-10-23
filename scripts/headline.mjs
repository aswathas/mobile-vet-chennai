// Prints the headline numbers the dossier prose cites.
//
// The prose is written by hand, so it needs one place where every figure it
// quotes is computed from the merged dataset rather than retyped. Run it after
// the research passes and before writing a word of the narrative.

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESEARCH = process.env.MVT_RESEARCH ?? 'research';

const inr = (n) => (typeof n === 'number' && Number.isFinite(n) ? Math.round(n).toLocaleString('en-IN') : '—');
const num = (n, d = 0) =>
  typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d })
    : '—';

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

const zoneA = await readJson(join(root, RESEARCH, 'zone-a', 'localities.json'));
const zoneB = await readJson(join(root, RESEARCH, 'zone-b', 'localities.json'));
const all = [
  ...zoneA.localities.map((l) => ({ ...l, zone: 'A' })),
  ...zoneB.localities.map((l) => ({ ...l, zone: 'B' })),
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const sum = (list, pick) => list.reduce((a, l) => a + (pick(l) || 0), 0);
const median = (arr) => {
  const s = arr.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!s.length) return NaN;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

function zoneBlock(letter, doc, list) {
  const hh = sum(list, (l) => l.population.households);
  const petHh = sum(list, (l) => l.pet_base.pet_households);
  const licensed = sum(list, (l) => l.pet_base.licensed_pets);
  const unlicensed = sum(list, (l) => l.pet_base.unlicensed_pets);
  const cases = sum(list, (l) => l.demand.cases_per_month_total);
  const ourRev = sum(list, (l) => l.economics.our_mix.monthly_revenue_potential);
  const marketRev = sum(list, (l) => l.economics.market_mix.monthly_revenue_potential);
  const oneRouteRev = sum(list, (l) => l.economics.serviceable_ceiling.one_route.monthly_revenue);
  const oneRouteContrib = sum(list, (l) => l.economics.serviceable_ceiling.one_route.contribution);
  const twoRouteRev = sum(list, (l) => l.economics.serviceable_ceiling.two_route.monthly_revenue);

  const weekday = {};
  for (const d of DAYS) weekday[d] = sum(list, (l) => l.demand.cases_per_month_total * (l.weekday[d] || 0));
  const wdTotal = Object.values(weekday).reduce((a, b) => a + b, 0) || 1;

  const hour = {};
  for (let h = 0; h < 24; h++) {
    const k = String(h).padStart(2, '0');
    hour[k] = sum(list, (l) => l.demand.cases_per_month_total * (l.hour_curve[k] || 0));
  }
  const hTotal = Object.values(hour).reduce((a, b) => a + b, 0) || 1;
  // The aggregate's hour keys are read in numeric order, never in object order:
  // JavaScript puts canonical numeric keys first, so "10" arrives before "00".
  const hourOrder = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));

  const season = {};
  for (const m of MONTHS) season[m] = sum(list, (l) => l.demand.cases_per_month_total * (l.seasonality.index?.[m] || 0));
  const sWeight = sum(list, (l) => l.demand.cases_per_month_total) || 1;
  for (const m of MONTHS) season[m] = season[m] / sWeight;

  const counts = list.reduce((acc, l) => ({ ...acc, [l.verdict.status]: (acc[l.verdict.status] || 0) + 1 }), {});
  const tiers = list.reduce((acc, l) => ({ ...acc, [l.demand.tier]: (acc[l.demand.tier] || 0) + 1 }), {});

  const ranked = list.slice().sort((a, b) => b.economics.our_mix.monthly_revenue_potential - a.economics.our_mix.monthly_revenue_potential);

  console.log(`\n================ ZONE ${letter}: ${doc.zone_name} ================`);
  console.log(`localities            ${list.length}`);
  console.log(`households            ${inr(hh)}`);
  console.log(`pet-owning households ${inr(petHh)} (${((petHh / hh) * 100).toFixed(1)}% of households)`);
  console.log(`licensed / unlicensed ${inr(licensed)} / ${inr(unlicensed)}`);
  console.log(`cases a month         ${inr(cases)}`);
  console.log(`cases a weekday avg   ${inr(cases / 30)}`);
  console.log(`our-mix revenue/mo    Rs ${inr(ourRev)}`);
  console.log(`market-mix revenue/mo Rs ${inr(marketRev)}  (our share ${((ourRev / marketRev) * 100).toFixed(1)}%)`);
  console.log(`median blended price  Rs ${inr(median(list.map((l) => l.price.our_mix.blended_price)))}`);
  console.log(`median market price   Rs ${inr(median(list.map((l) => l.price.market_mix.avg_visit_price)))}`);
  console.log(`one route could carry Rs ${inr(oneRouteRev)} revenue, Rs ${inr(oneRouteContrib)} contribution`);
  console.log(`two routes could carry Rs ${inr(twoRouteRev)}`);
  console.log(`revenue per route-hr  Rs ${inr(median(list.map((l) => l.economics.our_mix.revenue_per_route_hour)))}`);
  console.log(`verdicts              GO ${counts.GO || 0} / HOLD ${counts.HOLD || 0} / NO-GO ${counts['NO-GO'] || 0}`);
  console.log(`demand tiers          ${JSON.stringify(tiers)}`);
  console.log(`mean saturation       ${num(sum(list, (l) => l.competition.saturation_index) / list.length, 1)}`);
  console.log(`localities below Rs 1,100 blended: ${list.filter((l) => l.price.our_mix.blended_price < 1100).length}`);
  const topHours = hourOrder
    .map((h) => [h, hour[h] ?? 0])
    .sort((a, b) => b[1] - a[1]);
  console.log(`peak hour             ${topHours[0][0]}:00`);
  console.log(`top 3 hours           ${topHours.slice(0, 3).map(([h, v]) => `${h}:00 (${((v / hTotal) * 100).toFixed(1)}%)`).join(', ')}`);
  console.log(`weekday split         ${DAYS.map((d) => `${d} ${((weekday[d] / wdTotal) * 100).toFixed(1)}%`).join('  ')}`);
  console.log(`best month            ${Object.entries(season).sort((a, b) => b[1] - a[1])[0][0]} (index ${Object.entries(season).sort((a, b) => b[1] - a[1])[0][1].toFixed(1)}, ${(Object.entries(season).sort((a, b) => b[1] - a[1])[0][1] / 12).toFixed(1)}% of the year)`);
  console.log(`worst month           ${Object.entries(season).sort((a, b) => a[1] - b[1])[0][0]} (index ${Object.entries(season).sort((a, b) => a[1] - b[1])[0][1].toFixed(1)}, ${(Object.entries(season).sort((a, b) => a[1] - b[1])[0][1] / 12).toFixed(1)}%)`);
  console.log(`hub                   ${doc.hub?.name || '—'} — ${doc.hub?.rationale?.slice(0, 160) || ''}`);
  console.log('top 10 by our-mix monthly revenue:');
  for (const l of ranked.slice(0, 10)) {
    console.log(
      `  ${String(l.verdict.rank).padStart(2)} ${l.name.slice(0, 34).padEnd(34)} ${String(l.verdict.status).padEnd(5)} ` +
        `cases ${String(Math.round(l.demand.cases_per_month_total)).padStart(4)}  ` +
        `blended Rs ${String(inr(l.price.our_mix.blended_price)).padStart(7)}  ` +
        `rev Rs ${String(inr(l.economics.our_mix.monthly_revenue_potential)).padStart(9)}  ` +
        `sat ${String(l.competition.saturation_index).padStart(3)}  hh ${inr(l.population.households)}`
    );
  }
  console.log('bottom 5 by our-mix monthly revenue:');
  for (const l of ranked.slice(-5)) {
    console.log(
      `  ${l.name.slice(0, 34).padEnd(34)} ${String(l.verdict.status).padEnd(5)} cases ${String(Math.round(l.demand.cases_per_month_total)).padStart(4)}  ` +
        `blended Rs ${String(inr(l.price.our_mix.blended_price)).padStart(7)}  rev Rs ${inr(l.economics.our_mix.monthly_revenue_potential)}`
    );
  }
}

zoneBlock('A', zoneA, zoneA.localities.map((l) => ({ ...l, zone: 'A' })));
zoneBlock('B', zoneB, zoneB.localities.map((l) => ({ ...l, zone: 'B' })));

// ---- city -------------------------------------------------------------------

console.log('\n================ BOTH ZONES ================');
const casesAll = sum(all, (l) => l.demand.cases_per_month_total);
const ourAll = sum(all, (l) => l.economics.our_mix.monthly_revenue_potential);
const marketAll = sum(all, (l) => l.economics.market_mix.monthly_revenue_potential);
console.log(`localities            ${all.length}`);
console.log(`households            ${inr(sum(all, (l) => l.population.households))}`);
console.log(`pet-owning households ${inr(sum(all, (l) => l.pet_base.pet_households))}`);
console.log(`cases a month         ${inr(casesAll)}`);
console.log(`our-mix revenue/mo    Rs ${inr(ourAll)}`);
console.log(`market-mix revenue/mo Rs ${inr(marketAll)}`);
console.log(`our share of market   ${((ourAll / marketAll) * 100).toFixed(1)}%`);

const rankedAll = all.slice().sort((a, b) => b.economics.our_mix.monthly_revenue_potential - a.economics.our_mix.monthly_revenue_potential);
for (const n of [5, 10, 20]) {
  const t = rankedAll.slice(0, n).reduce((a, l) => a + l.economics.our_mix.monthly_revenue_potential, 0);
  console.log(`top ${String(n).padStart(2)} localities carry   ${((t / ourAll) * 100).toFixed(1)}% of our-mix revenue`);
}
const zoneA_ = sum(zoneA.localities, (l) => l.economics.our_mix.monthly_revenue_potential);
console.log(`zone A share          ${((zoneA_ / ourAll) * 100).toFixed(1)}% of our-mix revenue`);

// ---- route clusters ---------------------------------------------------------

const clusters = new Map();
for (const l of all) {
  const id = l.route_cluster || 'unassigned';
  if (!clusters.has(id)) clusters.set(id, []);
  clusters.get(id).push(l);
}
console.log('\nroute clusters:');
for (const [id, members] of [...clusters.entries()].sort(
  (a, b) =>
    sum(b[1], (l) => l.economics.our_mix.monthly_revenue_potential) -
    sum(a[1], (l) => l.economics.our_mix.monthly_revenue_potential)
)) {
  const c = sum(members, (l) => l.demand.cases_per_month_total);
  const r = sum(members, (l) => l.economics.our_mix.monthly_revenue_potential);
  const blend = members[0].price.our_mix.route_cluster_blend || members[0].price.our_mix.blended_price;
  const oneCases = Math.min(Math.round(c), 156);
  const con = Math.round(oneCases * (blend - 850));
  console.log(
    `  ${id.padEnd(6)} ${members[0].zone}  ${String(members.length).padStart(2)} localities  ` +
      `cases ${String(Math.round(c)).padStart(5)}  blend Rs ${String(inr(blend)).padStart(7)}  ` +
      `demand Rs ${String(inr(r)).padStart(9)}  one route (${String(oneCases).padStart(3)} visits) contribution Rs ${String(inr(con)).padStart(8)}  ` +
      `anchor ${members[0].name}`
  );
}
console.log(`\nclusters                ${clusters.size}`);
