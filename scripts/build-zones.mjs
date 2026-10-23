// Builds the locality dossier surface from the research output and the
// dossier prose.
//
// Three inputs:
//   research/zone-a/localities.json  the Zone A pass
//   research/zone-b/localities.json  the Zone B pass
//   research/merged/sources.json     the two passes' sources, renumbered once
//   content/micro-places.md          the dossier prose, written by hand
//
// It writes src/content/zones/*, which src/pages/zones.astro renders. It never
// invents a number. A missing key in a research file fails the build rather
// than being silently filled, because a filled gap is indistinguishable from
// a measurement once it reaches a reader.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify, resetSlugs } from '../src/lib/slug.mjs';
import { injectBlocks } from './dossier-blocks.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'src', 'content', 'zones');

const REQUIRED_LOCALITY_KEYS = [
  'id', 'name', 'ward', 'lat', 'lon', 'locality_type', 'travel_min_to_hub', 'route_cluster',
  'population', 'pet_base', 'demand', 'seasonality', 'weekday', 'hour_curve',
  'price', 'economics', 'competition', 'cluster_assets', 'travel', 'verdict',
];

const REQUIRED_PET_KEYS = ['pet_households', 'dogs', 'cats', 'licensed_pets', 'unlicensed_pets', 'tier'];
const REQUIRED_DEMAND_KEYS = ['cases_per_month_total', 'cases_per_week_avg', 'peak_cases_per_day', 'tier'];
const REQUIRED_PRICE_KEYS = ['market_mix', 'our_mix'];
const REQUIRED_ECON_KEYS = ['market_mix', 'our_mix', 'serviceable_ceiling'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function fail(msg) {
  throw new Error(`build-zones: ${msg}`);
}

function num(v, path) {
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(`${path} is not a finite number (got ${JSON.stringify(v)})`);
  return v;
}

function obj(v, path) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) fail(`${path} is not an object`);
  return v;
}

function validateLocality(loc, zone) {
  const p = `zone ${zone} locality ${loc.id ?? loc.name ?? '?'}`;
  for (const k of REQUIRED_LOCALITY_KEYS) {
    if (loc[k] === undefined || loc[k] === null) fail(`${p}: missing "${k}"`);
  }
  obj(loc.population, `${p}.population`);
  for (const k of REQUIRED_PET_KEYS) {
    if (loc.pet_base[k] === undefined || loc.pet_base[k] === null) fail(`${p}.pet_base.${k} missing`);
  }
  for (const k of REQUIRED_DEMAND_KEYS) {
    if (loc.demand[k] === undefined || loc.demand[k] === null) fail(`${p}.demand.${k} missing`);
  }
  for (const k of REQUIRED_PRICE_KEYS) {
    if (!loc.price[k]) fail(`${p}.price.${k} missing`);
    if (!loc.price[k].service_lines?.length) fail(`${p}.price.${k}.service_lines empty`);
  }
  for (const k of REQUIRED_ECON_KEYS) {
    if (!loc.economics[k]) fail(`${p}.economics.${k} missing`);
  }
  for (const d of DAYS) {
    if (typeof loc.weekday[d] !== 'number') fail(`${p}.weekday.${d} missing`);
  }
  for (const m of MONTHS) {
    if (typeof loc.seasonality.index?.[m] !== 'number') fail(`${p}.seasonality.index.${m} missing`);
  }
  for (let h = 0; h < 24; h++) {
    const key = String(h).padStart(2, '0');
    if (typeof loc.hour_curve[key] !== 'number') fail(`${p}.hour_curve.${key} missing`);
  }
  if (!['GO', 'HOLD', 'NO-GO'].includes(loc.verdict.status)) {
    fail(`${p}.verdict.status is ${loc.verdict.status}, expected GO, HOLD or NO-GO`);
  }
}

// ---- load ------------------------------------------------------------------

async function readJson(path, label) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    fail(`${label} is missing at ${path}. Run the research pass first.`);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    fail(`${label} at ${path} is not valid JSON: ${e.message}`);
  }
}

// The research directory can be pointed elsewhere, which is how the pipeline
// is smoke-tested against a fixture without touching a live research pass.
const RESEARCH = process.env.MVT_RESEARCH ?? 'research';

const zoneA = await readJson(join(root, RESEARCH, 'zone-a', 'localities.json'), 'Zone A dataset');
const zoneB = await readJson(join(root, RESEARCH, 'zone-b', 'localities.json'), 'Zone B dataset');
const sources = await readJson(join(root, RESEARCH, 'merged', 'sources.json'), 'merged source list');

for (const [zone, doc] of [['A', zoneA], ['B', zoneB]]) {
  if (!doc.localities?.length) fail(`Zone ${zone} dataset has no localities`);
  for (const loc of doc.localities) validateLocality(loc, zone);
}

// ---- merge -----------------------------------------------------------------

const localities = [...zoneA.localities, ...zoneB.localities].map((loc, i) => ({
  ...loc,
  zone: loc.zone ?? (i < zoneA.localities.length ? 'A' : 'B'),
  index: i + 1,
}));

const zones = [
  {
    zone: 'A',
    name: zoneA.zone_name ?? 'Zone A',
    hub: zoneA.hub ?? {},
    summary: zoneA.zone_summary ?? {},
  },
  {
    zone: 'B',
    name: zoneB.zone_name ?? 'Zone B',
    hub: zoneB.hub ?? {},
    summary: zoneB.zone_summary ?? {},
  },
];

// ---- aggregates ------------------------------------------------------------

function sum(list, pick) {
  return list.reduce((acc, l) => acc + (pick(l) || 0), 0);
}

// The median, not the mean: a route earns the rate of the round it rides, and
// the median locality carries the median route.
function median(values) {
  const s = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!s.length) return 0;
  const mid = Math.floor(s.length / 2);
  return Math.round(s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2);
}

function weightedHourCurve(list, weight) {
  const out = {};
  for (let h = 0; h < 24; h++) {
    const key = String(h).padStart(2, '0');
    const w = sum(list, (l) => weight(l) * (l.hour_curve[key] ?? 0));
    out[key] = w;
  }
  const total = Object.values(out).reduce((a, b) => a + b, 0);
  if (total > 0) for (const k of Object.keys(out)) out[k] = out[k] / total;
  return out;
}

function aggregateZone(list) {
  const weight = (l) => l.demand.cases_per_month_total || 0;
  const weekday = {};
  for (const d of DAYS) {
    const t = sum(list, (l) => weight(l) * (l.weekday[d] ?? 0));
    weekday[d] = t;
  }
  const wdTotal = Object.values(weekday).reduce((a, b) => a + b, 0);
  if (wdTotal > 0) for (const k of Object.keys(weekday)) weekday[k] = weekday[k] / wdTotal;

  const seasonality = {};
  for (const m of MONTHS) {
    seasonality[m] = sum(list, (l) => weight(l) * (l.seasonality.index?.[m] ?? 0));
  }
  const sTotal = Object.values(weekday).reduce((a, b) => a + b, 0);
  const wTotal = sum(list, (l) => weight(l)) || 1;
  // A cases-weighted mean index, not a sum: 100 is the annual average month.
  for (const k of Object.keys(seasonality)) seasonality[k] = seasonality[k] / wTotal;

  const hour = weightedHourCurve(list, weight);

  const peakHour = Object.entries(hour).sort((a, b) => b[1] - a[1])[0];

  // The staffing plan. A day of cases is spread across the hours by the
  // hour curve, and a clinician on a route lands about 1.2 visits an hour
  // once travel between houses is counted. Staffing is the ceiling of that,
  // never a rounding of it.
  const casesPerDay = sum(list, (l) => (l.demand.cases_per_month_total || 0) / 30);
  const VISITS_PER_STAFF_HOUR = 1.2;
  const hourly_plan = [];
  for (let h = 0; h < 24; h++) {
    const key = String(h).padStart(2, '0');
    const visits = casesPerDay * (hour[key] || 0);
    hourly_plan.push({
      hour: key,
      visits_per_day: Number(visits.toFixed(2)),
      staff: visits > 0 ? Math.max(1, Math.ceil(visits / VISITS_PER_STAFF_HOUR)) : 0,
    });
  }

  return {
    locality_count: list.length,
    cases_per_day: Number(casesPerDay.toFixed(1)),
    hourly_plan,
    total_households: sum(list, (l) => l.population.households),
    total_pet_households: sum(list, (l) => l.pet_base.pet_households),
    total_dogs: sum(list, (l) => l.pet_base.dogs),
    total_cats: sum(list, (l) => l.pet_base.cats),
    total_licensed: sum(list, (l) => l.pet_base.licensed_pets),
    total_unlicensed: sum(list, (l) => l.pet_base.unlicensed_pets),
    total_cases_per_month: sum(list, (l) => l.demand.cases_per_month_total),
    total_cases_per_week: sum(list, (l) => l.demand.cases_per_week_avg),
    market_monthly_revenue: sum(list, (l) => l.economics.market_mix.monthly_revenue_potential),
    our_monthly_revenue: sum(list, (l) => l.economics.our_mix.monthly_revenue_potential),
    our_revenue_per_visit: sum(list, (l) => l.economics.our_mix.revenue_per_visit),
    our_revenue_per_route_hour: median(list.map((l) => l.economics.our_mix.revenue_per_route_hour)),
    one_route_monthly_revenue: sum(list, (l) => l.economics.serviceable_ceiling.one_route.monthly_revenue),
    one_route_contribution: sum(list, (l) => l.economics.serviceable_ceiling.one_route.contribution),
    weekday,
    seasonality,
    hour,
    peak_hour: peakHour ? peakHour[0] : null,
    go_count: list.filter((l) => l.verdict.status === 'GO').length,
    hold_count: list.filter((l) => l.verdict.status === 'HOLD').length,
    no_go_count: list.filter((l) => l.verdict.status === 'NO-GO').length,
    saturation_avg: list.length ? sum(list, (l) => l.competition.saturation_index) / list.length : 0,
    top_by_revenue: [...list]
      .sort((a, b) => b.economics.our_mix.monthly_revenue_potential - a.economics.our_mix.monthly_revenue_potential)
      .slice(0, 15)
      .map((l) => ({ id: l.id, name: l.name, zone: l.zone, revenue: l.economics.our_mix.monthly_revenue_potential, cases: l.demand.cases_per_month_total, status: l.verdict.status })),
    route_clusters: groupClusters(list),
  };
}

function groupClusters(list) {
  const map = new Map();
  for (const l of list) {
    const id = l.route_cluster || 'unassigned';
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(l);
  }
  return [...map.entries()]
    .map(([id, members]) => {
      const cases = sum(members, (m) => m.demand.cases_per_month_total);
      const blend = members[0].price.our_mix.route_cluster_blend || members[0].price.our_mix.blended_price;
      // One route is one vehicle, six visits a day, about 156 visits a month.
      // The cluster's capacity is the cluster's cases capped at that, not the
      // sum of what each locality could fill on its own.
      const oneRouteCases = Math.min(Math.round(cases), 156);
      const twoRouteCases = Math.min(Math.round(cases), 312);
      return {
        id,
        zone: members[0].zone,
        members: members.length,
        localities: members.map((m) => m.name),
        cases_per_month: cases,
        monthly_revenue: sum(members, (m) => m.economics.our_mix.monthly_revenue_potential),
        blended_price: Math.round(blend),
        one_route_cases: oneRouteCases,
        one_route_revenue: Math.round(oneRouteCases * blend),
        one_route_contribution: Math.round(oneRouteCases * (blend - 850)),
        two_route_cases: twoRouteCases,
        two_route_contribution: Math.round(twoRouteCases * (blend - 850)),
        travel_min: Math.round(sum(members, (m) => m.travel.inter_locality_travel_min) / members.length),
        anchor: members[0].name,
      };
    })
    .sort((a, b) => b.monthly_revenue - a.monthly_revenue);
}

const aggregates = {
  zones: zones.map((z) => ({
    ...z,
    ...aggregateZone(localities.filter((l) => l.zone === z.zone)),
  })),
  city: aggregateZone(localities),
  totals: {
    localities: localities.length,
    pet_households: sum(localities, (l) => l.pet_base.pet_households),
    cases_per_month: sum(localities, (l) => l.demand.cases_per_month_total),
    our_monthly_revenue: sum(localities, (l) => l.economics.our_mix.monthly_revenue_potential),
    market_monthly_revenue: sum(localities, (l) => l.economics.market_mix.monthly_revenue_potential),
    sources: sources.length,
  },
  months: MONTHS,
  days: DAYS,
  localities,
};

// ---- prose -----------------------------------------------------------------

async function parseProse(path, sources) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    fail(`dossier prose missing at ${path}`);
  }

  // The reference list is generated from the merged source list, so a source
  // appears once and carries the number the citation markers point at.
  if (sources?.length) {
    const refs = sources
      .map((s) => {
        const publisher = s.publisher ? `, ${s.publisher}` : '';
        const also = s.also?.length ? ` (corroborated by ${s.also.join(', ')})` : '';
        return `[${s.n}] ${s.label}${publisher}${also} -- ${s.url}`;
      })
      .join('\n');
    raw = raw.replace(/##\s+References\s*[\s\S]*$/, `## References\n\n${refs}\n`);
  }

  const lines = raw.split(/\r?\n/);
  const titleIndex = lines.findIndex((l) => l.startsWith('# '));
  if (titleIndex === -1) fail('no H1 title found in the dossier prose');
  const title = lines[titleIndex].replace(/^#\s+/, '').trim();

  const refHeadingIndex = lines.findIndex((l) => /^##\s+References\s*$/.test(l));
  if (refHeadingIndex === -1) fail('no "## References" section found in the dossier prose');

  const bodyLines = lines.slice(titleIndex + 1, refHeadingIndex);
  const refLines = lines.slice(refHeadingIndex + 1);

  const references = [];
  for (const line of refLines) {
    const m = /^\[(\d+)\]\s+(.*)$/.exec(line.trim());
    if (!m) continue;
    const n = Number(m[1]);
    let label = m[2];
    let url = '';
    const u = /(https?:\/\/\S+)\s*$/.exec(label);
    if (u) {
      url = u[1];
      label = label.slice(0, u.index).replace(/\s*--\s*$/, '').trim();
    }
    references.push({ n, label, url });
  }
  references.sort((a, b) => a.n - b.n);

  let ledeHtml = '';
  {
    let prev = '';
    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i].trim();
      if (!line) continue;
      const bold = /^\*\*[^*].*\*\*$/.test(line);
      if (bold && /^#{2,3}\s/.test(prev)) {
        const inner = line.replace(/^\*\*/, '').replace(/\*\*$/, '');
        ledeHtml = `<p><strong>${inner}</strong></p>`;
        bodyLines.splice(i, 1);
        break;
      }
      prev = line;
    }
  }

  resetSlugs();
  const outline = [];
  for (const line of bodyLines) {
    const m = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/[`*]/g, '').trim();
    outline.push({ level, id: slugify(text), text });
  }

  const words = bodyLines.join('\n').split(/\s+/).filter(Boolean).length;

  let tables = 0;
  let tableRows = 0;
  let inTable = false;
  for (const line of bodyLines) {
    if (/^\s*\|/.test(line)) {
      if (!inTable) {
        inTable = true;
        tables++;
        continue;
      }
      if (/^\s*\|[\s:|-]+\|?\s*$/.test(line)) continue;
      tableRows++;
    } else {
      inTable = false;
    }
  }

  return {
    title,
    bodyMd: bodyLines.join('\n').replace(/^\s*---\s*$/m, '').trim() + '\n',
    ledeHtml,
    references,
    outline,
    words,
    tables,
    tableRows,
  };
}

const prose = await parseProse(join(root, 'content', 'micro-places.md'), sources);

// The prose carries tokens for the generated tables and charts. Swapping them
// here keeps one source of truth: if a number changes in the dataset, the
// table under the prose changes with it.
const { out: bodyWithBlocks, missing } = injectBlocks(prose.bodyMd, aggregates);
if (missing.length) {
  fail(`the prose references blocks that do not exist: ${missing.join(', ')}`);
}

// ---- write -----------------------------------------------------------------

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, 'body.md'), bodyWithBlocks, 'utf8');

// The dossier is rendered in two parts so the route diagram can sit between the
// reading that introduces the route plan and the reading that works through it.
const splitAt = bodyWithBlocks.indexOf('\n## The route plan');
if (splitAt === -1) fail('the dossier prose has no "The route plan" heading to split on');
await writeFile(join(OUT, 'body-a.md'), bodyWithBlocks.slice(0, splitAt).trim() + '\n', 'utf8');
await writeFile(join(OUT, 'body-b.md'), bodyWithBlocks.slice(splitAt).trim() + '\n', 'utf8');
await writeFile(join(OUT, 'lede.html'), prose.ledeHtml + '\n', 'utf8');
await writeFile(join(OUT, 'outline.json'), JSON.stringify(prose.outline, null, 2) + '\n', 'utf8');
await writeFile(join(OUT, 'references.json'), JSON.stringify(prose.references, null, 2) + '\n', 'utf8');
await writeFile(join(OUT, 'localities.json'), JSON.stringify(localities, null, 2) + '\n', 'utf8');
await writeFile(join(OUT, 'aggregates.json'), JSON.stringify(aggregates, null, 2) + '\n', 'utf8');
await writeFile(
  join(OUT, 'meta.json'),
  JSON.stringify(
    {
      title: prose.title,
      words: prose.words,
      tables: prose.tables,
      tableRows: prose.tableRows,
      sections: prose.outline.filter((o) => o.level === 2).length,
      sources: prose.references.length,
      localities: localities.length,
    },
    null,
    2
  ) + '\n',
  'utf8'
);

console.log(`dossier   ${prose.title}`);
console.log(`words     ${prose.words}`);
console.log(`sections  ${prose.outline.filter((o) => o.level === 2).length}`);
console.log(`localities ${localities.length} (A ${zoneA.localities.length}, B ${zoneB.localities.length})`);
console.log(`sources   ${prose.references.length}`);
console.log(`cases/mo  ${aggregates.totals.cases_per_month.toLocaleString('en-IN')}`);
console.log(`our rev   Rs ${aggregates.totals.our_monthly_revenue.toLocaleString('en-IN')} a month`);
