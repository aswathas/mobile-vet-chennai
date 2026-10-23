// Audits the merged dossier dataset.
//
// It does not change anything. It reports the things that would embarrass the
// dossier in front of the founding team: rows whose own arithmetic does not
// close, a blended price under the Rs 1,100 floor, a weekday split that does
// not sum to one, a duplicate locality name across the two zones, or a
// clustering that puts a scattered locality in a clustered round.
//
// Run it before the dossier is written.

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESEARCH = process.env.MVT_RESEARCH ?? 'research';

const FLOOR = 1100;
const COST = 850;

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

const zoneA = await readJson(join(root, RESEARCH, 'zone-a', 'localities.json'));
const zoneB = await readJson(join(root, RESEARCH, 'zone-b', 'localities.json'));
zoneA.localities = zoneA.localities.map((l) => ({ ...l, zone: l.zone ?? 'A' }));
zoneB.localities = zoneB.localities.map((l) => ({ ...l, zone: l.zone ?? 'B' }));
const all = [...zoneA.localities, ...zoneB.localities];

const findings = [];
const add = (level, msg) => findings.push({ level, msg });

console.log(`localities      ${all.length}`);
console.log(`zones           A ${zoneA.localities.length}, B ${zoneB.localities.length}`);

// ---- arithmetic that has to close ------------------------------------------

for (const l of all) {
  const p = `${l.zone}/${l.name}`;

  const wd = Object.values(l.weekday).reduce((a, b) => a + b, 0);
  if (Math.abs(wd - 1) > 0.02) add('warn', `${p}: weekday split sums to ${wd.toFixed(3)}, not 1`);

  const hc = Object.values(l.hour_curve).reduce((a, b) => a + b, 0);
  if (Math.abs(hc - 1) > 0.02) add('warn', `${p}: hour curve sums to ${hc.toFixed(3)}, not 1`);

  const month = l.demand.cases_per_month_total;
  const week = l.demand.cases_per_week_avg;
  if (month > 0 && week > 0) {
    const implied = (week * 30) / 7;
    const drift = Math.abs(implied - month) / month;
    if (drift > 0.15) add('warn', `${p}: weekly ${week} implies ${implied.toFixed(0)} a month against ${month} stated`);
  }

  const blended = l.price.our_mix.blended_price;
  if (blended < FLOOR) add('info', `${p}: our-mix blended price Rs ${blended} is under the Rs ${FLOOR} floor`);

  const rev = l.economics.our_mix.monthly_revenue_potential;
  const rpv = l.economics.our_mix.revenue_per_visit;
  const cases = l.demand.cases_per_month_total;
  if (rev > 0 && cases > 0) {
    const impliedVisits = rev / rpv;
    if (impliedVisits > cases * 1.05) {
      add('warn', `${p}: revenue of Rs ${rev} at Rs ${rpv} a visit needs ${impliedVisits.toFixed(0)} visits against ${cases} cases`);
    }
  }

  if (l.verdict.status === 'GO' && rev < 50000) {
    add('info', `${p}: marked GO on Rs ${Math.round(rev).toLocaleString('en-IN')} a month`);
  }
  if (l.verdict.status === 'NO-GO' && rev > 150000) {
    add('info', `${p}: marked NO-GO but carries Rs ${Math.round(rev).toLocaleString('en-IN')} a month`);
  }

  if (l.travel.scattered_or_clustered === 'clustered' && l.travel.inter_locality_travel_min > 20) {
    add('warn', `${p}: clustered but ${l.travel.inter_locality_travel_min} minutes between stops`);
  }
}

// ---- duplicates across the two zones ---------------------------------------

const byName = new Map();
for (const l of all) {
  const key = l.name.trim().toLowerCase();
  if (!byName.has(key)) byName.set(key, []);
  byName.get(key).push(l);
}
for (const [name, list] of byName) {
  if (list.length > 1) {
    add('warn', `duplicate locality "${name}" appears ${list.length} times: ${list.map((l) => l.zone).join(', ')}`);
  }
}

// ---- ranks -----------------------------------------------------------------

for (const [zone, doc] of [['A', zoneA], ['B', zoneB]]) {
  const ranks = doc.localities.map((l) => l.verdict.rank).sort((a, b) => a - b);
  const expected = ranks.map((_, i) => i + 1);
  if (ranks.join(',') !== expected.join(',')) {
    add('warn', `zone ${zone}: ranks are not 1..${ranks.length} with no gaps`);
  }

  const statuses = new Set(doc.localities.map((l) => l.verdict.status));
  if (statuses.size === 1) {
    add('error', `zone ${zone}: every locality carries the same verdict (${[...statuses][0]}). A verdict that never discriminates is not a verdict.`);
  }
}

// ---- tiers -----------------------------------------------------------------

const tierCount = all.reduce((acc, l) => ({ ...acc, [l.demand.tier]: (acc[l.demand.tier] || 0) + 1 }), {});
console.log(`tiers           ${JSON.stringify(tierCount)}`);

const modelledShare = (tierCount.C || 0) / all.length;
console.log(`modelled share  ${(modelledShare * 100).toFixed(0)}% of localities at tier C`);

// ---- headline numbers ------------------------------------------------------

const cases = all.reduce((a, l) => a + l.demand.cases_per_month_total, 0);
const ourRev = all.reduce((a, l) => a + l.economics.our_mix.monthly_revenue_potential, 0);
const marketRev = all.reduce((a, l) => a + l.economics.market_mix.monthly_revenue_potential, 0);
console.log(`cases a month   ${cases.toLocaleString('en-IN')}`);
console.log(`our mix rev     Rs ${Math.round(ourRev).toLocaleString('en-IN')}`);
console.log(`market mix rev  Rs ${Math.round(marketRev).toLocaleString('en-IN')}`);
console.log(`our share       ${((ourRev / marketRev) * 100).toFixed(1)}% of the market's revenue`);

const ranked = all.slice().sort((a, b) => b.economics.our_mix.monthly_revenue_potential - a.economics.our_mix.monthly_revenue_potential);
const top10 = ranked.slice(0, 10).reduce((a, l) => a + l.economics.our_mix.monthly_revenue_potential, 0);
console.log(`top ten share   ${((top10 / ourRev) * 100).toFixed(1)}% of the two zones' revenue`);

// ---- findings --------------------------------------------------------------

const byLevel = { error: [], warn: [], info: [] };
for (const f of findings) byLevel[f.level].push(f.msg);

console.log('');
if (byLevel.error.length) {
  console.log(`ERRORS (${byLevel.error.length})`);
  for (const m of byLevel.error) console.log(`  x ${m}`);
}
if (byLevel.warn.length) {
  console.log(`WARNINGS (${byLevel.warn.length})`);
  for (const m of byLevel.warn) console.log(`  ! ${m}`);
}
if (byLevel.info.length) {
  console.log(`NOTES (${byLevel.info.length})`);
  for (const m of byLevel.info.slice(0, 25)) console.log(`  - ${m}`);
  if (byLevel.info.length > 25) console.log(`  ... and ${byLevel.info.length - 25} more`);
}
if (!findings.length) console.log('no findings');
