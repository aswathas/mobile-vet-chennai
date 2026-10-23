// Builds a small fixture dataset so the dossier pipeline can be exercised
// without a live research pass.
//
// It writes research/fixture/{zone-a,zone-b}/localities.json and
// research/fixture/merged/sources.json. Run the build against it with
// MVT_RESEARCH=research/fixture. The numbers are made up and exist only to
// prove the shapes render.

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'research', 'fixture');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function hourCurve(peak) {
  const out = {};
  for (let h = 0; h < 24; h++) {
    const d = Math.abs(h - peak);
    out[String(h).padStart(2, '0')] = Math.max(0.001, Math.exp(-(d * d) / 9) + (h >= 19 && h <= 22 ? 0.05 : 0));
  }
  const total = Object.values(out).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(out)) out[k] = Number((out[k] / total).toFixed(6));
  return out;
}

function weekday(weekendLift) {
  const base = { Mon: 1, Tue: 1, Wed: 1, Thu: 1, Fri: 1.05, Sat: 1 + weekendLift, Sun: 1 + weekendLift * 0.8 };
  const total = Object.values(base).reduce((a, b) => a + b, 0);
  const out = {};
  for (const k of DAYS) out[k] = Number((base[k] / total).toFixed(4));
  return out;
}

function seasonality(peak) {
  const raw = MONTHS.map((_, i) => 1 + 0.35 * Math.cos(((i - peak) / 12) * 2 * Math.PI));
  const avg = raw.reduce((a, b) => a + b, 0) / raw.length;
  const out = {};
  MONTHS.forEach((m, i) => (out[m] = Number(((raw[i] / avg) * 100).toFixed(1))));
  return out;
}

function makeLocality(zone, i, spec) {
  const id = `${zone}${String(i + 1).padStart(2, '0')}`;
  const cases = spec.cases;
  const price = spec.price;
  const blended = Math.max(1199, Math.round(price * 1.06));
  const visits = Math.round(cases / 2.4);
  const revenue = visits * blended;
  const routeHour = Math.round(revenue / 26);

  return {
    id,
    name: spec.name,
    aliases: [],
    ward: spec.ward,
    assembly_constituency: spec.constituency,
    pin_codes: spec.pins,
    lat: spec.lat,
    lon: spec.lon,
    locality_type: spec.type,
    travel_km_to_hub: spec.travelKm,
    travel_min_to_hub: spec.travelMin,
    route_cluster: spec.cluster,
    population: { households: spec.households, tier: 'B', basis: 'fixture' },
    pet_base: {
      pet_households: Math.round(spec.households * spec.petRate),
      dogs: Math.round(spec.households * spec.petRate * 0.82),
      cats: Math.round(spec.households * spec.petRate * 0.18),
      other_pets: 0,
      licensed_pets: Math.round(spec.households * spec.petRate * spec.licensedRate),
      unlicensed_pets: Math.round(spec.households * spec.petRate * (1 - spec.licensedRate)),
      license_penetration_pct: Number((spec.licensedRate * 100).toFixed(1)),
      tier: 'C',
      basis: 'fixture',
    },
    demand: {
      cases_per_month_total: cases,
      cases_per_week_avg: Number((cases / 4.33).toFixed(1)),
      peak_cases_per_day: Math.max(2, Math.round(cases / 26 * 2.4)),
      peak_cover_definition: 'fixture',
      tier: 'C',
      basis: 'fixture',
    },
    seasonality: { index: seasonality(spec.seasonPeak), basis: 'fixture' },
    weekday: weekday(spec.weekendLift),
    weekend_uplift_pct: Number((spec.weekendLift * 100).toFixed(0)),
    hour_curve: hourCurve(spec.peakHour),
    peak_window: { start: '10:00', end: '13:00' },
    price: {
      market_mix: {
        avg_visit_price: price,
        service_lines: [
          { line: 'Home consultation', price: Math.round(price * 0.65), share_pct: 62 },
          { line: 'Extended check-up', price: Math.round(price * 1.5), share_pct: 20 },
          { line: 'Vaccination at home', price: Math.round(price * 0.9), share_pct: 12 },
          { line: 'End of life', price: 6800, share_pct: 2 },
        ],
        monthly_spend_per_customer: Math.round(price * 1.9),
        tier: 'C',
        basis: 'fixture',
      },
      our_mix: {
        avg_visit_price: blended,
        blended_price: blended,
        service_lines: [
          { line: 'Chronic monitoring', price: 1199, share_pct: 34 },
          { line: 'Senior wellness bundle', price: 1999, share_pct: 18 },
          { line: 'Extended consultation', price: 1699, share_pct: 28 },
          { line: 'Licence compliance bundle', price: 899, share_pct: 14 },
          { line: 'End of life', price: 6800, share_pct: 2 },
          { line: 'General consultation', price: 699, share_pct: 4 },
        ],
        monthly_spend_per_customer: Math.round(blended * 2.6),
        tier: 'C',
        basis: 'fixture',
      },
    },
    economics: {
      market_mix: {
        monthly_revenue_potential: Math.round(cases * price * 0.62),
        revenue_per_visit: price,
        revenue_per_weekday: Object.fromEntries(DAYS.map((d) => [d, Math.round((cases * price * 0.62) / 30)])),
        revenue_per_route_hour: Math.round((cases * price * 0.62) / 26),
      },
      our_mix: {
        monthly_revenue_potential: revenue,
        revenue_per_visit: blended,
        revenue_per_weekday: Object.fromEntries(DAYS.map((d) => [d, Math.round(revenue / 30)])),
        revenue_per_route_hour: routeHour,
      },
      serviceable_ceiling: {
        one_route: {
          cases_per_month: Math.min(cases, 156),
          monthly_revenue: Math.min(cases, 156) * blended,
          contribution: Math.round(Math.min(cases, 156) * (blended - 850)),
        },
        two_route: {
          cases_per_month: Math.min(cases, 312),
          monthly_revenue: Math.min(cases, 312) * blended,
          contribution: Math.round(Math.min(cases, 312) * (blended - 850)),
        },
      },
      cost_per_visit_clustered: 850,
      blended_floor: 1100,
    },
    competition: {
      competitor_count: spec.competitors,
      saturation_index: spec.saturation,
      named: [
        { name: 'Little Angels Pet Clinic', type: 'clinic-home-arm', price_observed: 299, rating: 4.2, reviews: 180, url: 'https://www.littleangelspetclinic.com/vet-home-visit-chennai.html', tier: 'A' },
        { name: 'Vetic', type: 'clinic-home-arm', price_observed: 399, rating: 4.1, reviews: 90, url: 'https://vetic.in/vet-at-home', tier: 'A' },
      ],
    },
    cluster_assets: {
      apartment_complexes: spec.apartments,
      gated_communities: spec.gated,
      pet_friendly_associations: spec.associations,
      notable_clusters: [spec.name + ' block 3'],
      tier: 'C',
      basis: 'fixture',
    },
    travel: {
      inter_locality_travel_min: 8,
      services_per_trip_possible: 5,
      scattered_or_clustered: 'clustered',
      notes: 'fixture',
    },
    verdict: {
      status: spec.verdict,
      reason: `Rs ${blended} blended against a Rs 850 cost, ${spec.competitors} competitors on the ground.`,
      rank: i + 1,
      confidence: 'medium',
    },
  };
}

const ZONE_A = [
  { name: 'Velachery', ward: 'Velachery', constituency: 'Sriperumbudur', pins: ['600042'], lat: 12.9189, lon: 80.2201, type: 'apartment-cluster', travelKm: 3.2, travelMin: 14, cluster: 'A-R1', households: 18400, petRate: 0.21, licensedRate: 0.62, cases: 640, price: 780, peakHour: 11, seasonPeak: 1, weekendLift: 0.22, competitors: 9, saturation: 68, apartments: 42, gated: 14, associations: 6, verdict: 'GO' },
  { name: 'Pallikaranai', ward: 'Pallikaranai', constituency: 'Sriperumbudur', pins: ['600117'], lat: 12.9349, lon: 80.2103, type: 'apartment-cluster', travelKm: 4.1, travelMin: 18, cluster: 'A-R1', households: 14900, petRate: 0.19, licensedRate: 0.58, cases: 512, price: 760, peakHour: 11, seasonPeak: 1, weekendLift: 0.2, competitors: 7, saturation: 61, apartments: 36, gated: 11, associations: 5, verdict: 'GO' },
  { name: 'Medavakkam', ward: 'Medavakkam', constituency: 'Sriperumbudur', pins: ['600100'], lat: 12.9197, lon: 80.1925, type: 'mixed', travelKm: 6.8, travelMin: 26, cluster: 'A-R2', households: 12100, petRate: 0.17, licensedRate: 0.49, cases: 388, price: 690, peakHour: 10, seasonPeak: 1, weekendLift: 0.18, competitors: 5, saturation: 47, apartments: 19, gated: 5, associations: 3, verdict: 'HOLD' },
];

const ZONE_B = [
  { name: 'Sholinganallur', ward: 'Sholinganallur', constituency: 'Sholinganallur', pins: ['600117'], lat: 12.9010, lon: 80.2278, type: 'apartment-cluster', travelKm: 2.6, travelMin: 12, cluster: 'B-R1', households: 21000, petRate: 0.26, licensedRate: 0.71, cases: 812, price: 860, peakHour: 12, seasonPeak: 1, weekendLift: 0.25, competitors: 11, saturation: 74, apartments: 55, gated: 19, associations: 8, verdict: 'GO' },
  { name: 'Navalur', ward: 'Navalur', constituency: 'Sholinganallur', pins: ['600130'], lat: 12.8437, lon: 80.2271, type: 'apartment-cluster', travelKm: 5.4, travelMin: 22, cluster: 'B-R1', households: 17600, petRate: 0.24, licensedRate: 0.68, cases: 704, price: 840, peakHour: 12, seasonPeak: 1, weekendLift: 0.24, competitors: 9, saturation: 70, apartments: 48, gated: 16, associations: 7, verdict: 'GO' },
  { name: 'Thiruvanmiyur', ward: 'Thiruvanmiyur', constituency: 'Tiruvanmiyur', pins: ['600041'], lat: 12.9831, lon: 80.2594, type: 'mixed', travelKm: 9.2, travelMin: 34, cluster: 'B-R2', households: 15900, petRate: 0.2, licensedRate: 0.64, cases: 496, price: 810, peakHour: 11, seasonPeak: 1, weekendLift: 0.19, competitors: 8, saturation: 66, apartments: 28, gated: 9, associations: 4, verdict: 'HOLD' },
];

const zoneA = {
  zone: 'A',
  zone_name: 'South-east cluster',
  hub: { name: 'Medavakkam junction', lat: 12.9200, lon: 80.1930, rationale: 'fixture' },
  localities: ZONE_A.map((s, i) => makeLocality('A', i, s)),
  zone_summary: { locality_count: 3, total_households: 45400, total_pet_households: 8717, total_cases_per_month: 1540, our_mix_monthly_revenue_potential: 412000, top_go_localities: [], avoid_localities: [], route_clusters: [], staffing_by_hour: [], key_caveats: ['fixture'] },
};

const zoneB = {
  zone: 'B',
  zone_name: 'OMR and ECR corridor',
  hub: { name: 'Sholinganallur junction', lat: 12.9010, lon: 80.2278, rationale: 'fixture' },
  localities: ZONE_B.map((s, i) => makeLocality('B', i, s)),
  zone_summary: { locality_count: 3, total_households: 54500, total_pet_households: 12320, total_cases_per_month: 2012, our_mix_monthly_revenue_potential: 578000, top_go_localities: [], avoid_localities: [], route_clusters: [], staffing_by_hour: [], key_caveats: ['fixture'] },
};

const sources = [
  { n: 1, label: 'Little Angels Pet Clinic, Vet Home Visit in Chennai', url: 'https://www.littleangelspetclinic.com/vet-home-visit-chennai.html' },
  { n: 2, label: 'Vetic, Vet at Home', url: 'https://vetic.in/vet-at-home' },
  { n: 3, label: 'Greater Chennai Corporation, PR-151 Dog License', url: 'https://www.chennaicorporation.gov.in/news/news_20260512_1.pdf' },
];

await mkdir(join(OUT, 'zone-a'), { recursive: true });
await mkdir(join(OUT, 'zone-b'), { recursive: true });
await mkdir(join(OUT, 'merged'), { recursive: true });
await writeFile(join(OUT, 'zone-a', 'localities.json'), JSON.stringify(zoneA, null, 2), 'utf8');
await writeFile(join(OUT, 'zone-b', 'localities.json'), JSON.stringify(zoneB, null, 2), 'utf8');
await writeFile(join(OUT, 'merged', 'sources.json'), JSON.stringify(sources, null, 2), 'utf8');

console.log('fixture written to research/fixture');
console.log('run with MVT_RESEARCH=research/fixture npm run zones');
