// Blocks for the locality dossier.
//
// Every table and every chart in the dossier is generated from the merged
// research dataset, so a number can never drift between the prose and the
// figure. The prose carries a token such as {{table:top-localities}} and the
// build swaps in the block. Nothing here writes prose.
//
// The world is the same one the report uses: black ground, flag orange, one
// condensed grotesk, a monospace for every numeral. Rank is expressed by cell
// count and bar length, never by type size.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const inr = (n) => (typeof n === 'number' && Number.isFinite(n) ? Math.round(n).toLocaleString('en-IN') : '—');
const num = (n, d = 0) =>
  typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d })
    : '—';
const pct = (n, d = 1) =>
  typeof n === 'number' && Number.isFinite(n) ? `${num(n, d)}%` : '—';
const rs = (n) => `Rs ${inr(n)}`;
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Tables are emitted as HTML rather than Markdown so they can sit inside a
// scroll region. A locality table carries nine columns of real values, and on
// a phone or a narrow sheet it has to scroll sideways inside the window
// instead of bleeding off the edge of the page.
function table(headers, rows, opts = {}) {
  const head = `<thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>`;
  const body = `<tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody>`;
  const label = opts.label ? ` aria-label="${esc(opts.label)}"` : '';
  const note = opts.note ? `\n<p class="tbl__note">${opts.note}</p>` : '';
  return `<div class="tbl-scroll"${label} tabindex="0" role="region"><table>${head}${body}</table></div>${note}`;
}

// ---- charts ----------------------------------------------------------------

// A 24-hour demand curve for both zones, drawn as a bar per hour. Two series
// share one frame so the reader compares zones without moving the eye, side by
// side rather than on top of each other. The peak hour of each zone is the one
// bar in yellow: it is the hour to go.
//
// The hours are read in numeric order on purpose. The aggregate's hour object
// is keyed by strings like "10" and "00", and a JavaScript object puts its
// canonical numeric keys first, so the raw key order is 10, 11, ... 23, 00,
// ... 09. Reading it as written would put the morning peak under the label for
// midnight.
function hourCurveChart(agg) {
  const W = 900;
  const H = 260;
  const padL = 44;
  const padB = 34;
  const padT = 16;
  const plotW = W - padL - 16;
  const plotH = H - padB - padT;
  const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));
  const max = Math.max(
    ...agg.zones.map((z) => Math.max(...HOURS.map((h) => z.hour[h] ?? 0))),
    0.0001
  );
  const bw = plotW / 24;
  const barW = Math.max(3, bw * 0.3);

  const y = (v) => padT + plotH - (v / max) * plotH;
  const series = agg.zones.map((z, i) => {
    const peak = HOURS.reduce((a, h) => ((z.hour[h] ?? 0) > (z.hour[a] ?? 0) ? h : a), '00');
    const pts = HOURS.map((h, idx) => {
      const v = z.hour[h] ?? 0;
      // Zone A sits on the left of the hour, Zone B on the right, so neither
      // series hides the other.
      const offset = i === 0 ? -barW - 1 : 1;
      const x = padL + idx * bw + bw / 2 + offset;
      const cls = h === peak ? 'ch-bar--peak' : i === 0 ? 'ch-bar--a' : 'ch-bar--b';
      return `<rect x="${(x - barW / 2).toFixed(1)}" y="${y(v).toFixed(1)}" width="${barW.toFixed(1)}" height="${(padT + plotH - y(v)).toFixed(1)}" class="ch-bar ${cls}"><title>${esc(z.name)} ${h}:00 — ${pct(v * 100, 2)} of the day's demand</title></rect>`;
    });
    return pts.join('');
  });

  const gridlines = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => {
      const yy = y(max * f);
      return `<line x1="${padL}" x2="${W - 16}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}" class="ch-grid"/><text x="${padL - 8}" y="${(yy + 4).toFixed(1)}" class="ch-axis" text-anchor="end">${num(max * f * 100, 1)}%</text>`;
    })
    .join('');

  const ticks = Array.from({ length: 24 }, (_, h) => {
    if (h % 3 !== 0) return '';
    const x = padL + h * bw + bw / 2;
    return `<text x="${x.toFixed(1)}" y="${H - 12}" class="ch-axis" text-anchor="middle">${String(h).padStart(2, '0')}</text>`;
  }).join('');

  const legend = agg.zones
    .map(
      (z, i) =>
        `<span class="ch-key"><i class="ch-key__mark ch-key__mark--${i === 0 ? 'a' : 'b'}"></i>${esc(z.name)}</span>`
    )
    .join('');

  return `<figure class="chart">
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Share of daily demand by hour for each zone">
    <defs>
      <pattern id="ch-hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="var(--paper)"/>
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink)" stroke-width="2.4"/>
      </pattern>
    </defs>
    ${gridlines}
    ${series.join('')}
    ${ticks}
    <line x1="${padL}" x2="${W - 16}" y1="${padT + plotH}" y2="${padT + plotH}" class="ch-axis-line"/>
  </svg>
  <figcaption class="chart__cap">Demand by hour of day, both zones, weighted by cases a month. The bar in yellow is the hour to be on the road. <span class="chart__keys">${legend}</span></figcaption>
</figure>`;
}

// A weekday strip. Each day is a cell; the fill is the day's share, and the
// busiest day of the zone is the cell in yellow.
function weekdayChart(agg) {
  const frames = agg.zones
    .map((z) => {
      const max = Math.max(...Object.values(z.weekday));
      const peak = Object.entries(z.weekday).sort((a, b) => b[1] - a[1])[0][0];
      const cells = DAYS.map((d, i) => {
        const share = z.weekday[d];
        const fill = max > 0 ? share / max : 0;
        const steps = Math.max(1, Math.round(fill * 8));
        const cls = d === peak ? 'wk__cell wk__cell--peak' : 'wk__cell';
        return `<div class="${cls}"><span class="wk__fill" style="--fill:${steps}"></span><span class="wk__k">${d}</span><span class="wk__v">${pct(share * 100, 1)}</span></div>`;
      }).join('');
      return `<div class="wk__row"><span class="wk__zone" title="${esc(z.name)}">Zone ${esc(z.zone)}</span><div class="wk__cells">${cells}</div></div>`;
    })
    .join('');

  return `<figure class="chart">
  <div class="wk">${frames}</div>
  <figcaption class="chart__cap">Share of weekly demand by day. The fill marks the day's weight against the busiest day of that zone, and yellow marks the day to be on the road.</figcaption>
</figure>`;
}

// Twelve months, two zones, one cell each. The best month of the zone is
// yellow: it is the month to launch into.
function seasonChart(agg) {
  const rows = agg.zones
    .map((z) => {
      const peak = Object.entries(z.seasonality).sort((a, b) => b[1] - a[1])[0][0];
      const cells = MONTHS.map((m) => {
        const v = z.seasonality[m];
        const h = Math.max(4, Math.round((v / 130) * 52));
        const cls = m === peak ? 'se__cell se__cell--peak' : 'se__cell';
        return `<div class="${cls}"><span class="se__bar" style="height:${h}px" title="${m}: index ${num(v, 0)}"></span><span class="se__k">${m}</span><span class="se__v">${num(v, 0)}</span></div>`;
      }).join('');
      return `<div class="se__row"><span class="se__zone" title="${esc(z.name)}">Zone ${esc(z.zone)}</span><div class="se__cells">${cells}</div></div>`;
    })
    .join('');

  return `<figure class="chart">
  <div class="se">${rows}</div>
  <figcaption class="chart__cap">Seasonal demand index by month, 100 equal to the annual average month. The index is demand, not visit capacity: heat and monsoon cut the days a visit can happen, and they also raise the value of the visit. Yellow is the month to launch into.</figcaption>
</figure>`;
}

// The revenue ranking, longest bar first. The top bar is yellow: it is the
// destination.
function revenueChart(agg) {
  const top = agg.city.top_by_revenue;
  const max = Math.max(...top.map((t) => t.revenue), 1);
  const rows = top
    .map(
      (t, i) => `<div class="rb__row${i === 0 ? ' rb__row--top' : ''}">
      <span class="rb__name">${esc(t.name)}</span>
      <span class="rb__track"><span class="rb__bar" style="width:${((t.revenue / max) * 100).toFixed(1)}%"></span></span>
      <span class="rb__v">${rs(t.revenue)}</span>
      <span class="rb__z">${t.zone}</span>
    </div>`
    )
    .join('');
  return `<figure class="chart">
  <div class="rb">${rows}</div>
  <figcaption class="chart__cap">Monthly revenue potential for our service mix in the fifteen strongest localities. This is demand the route could reach, not revenue already booked. The top bar is where the first route goes.</figcaption>
</figure>`;
}

// ---- tables ----------------------------------------------------------------

function zoneScorecard(agg, zoneLetter) {
  const z = agg.zones.find((x) => x.zone === zoneLetter);
  const rows = [
    ['Localities in the zone', num(z.locality_count)],
    ['Households', num(z.total_households)],
    ['Pet-owning households', num(z.total_pet_households)],
    ['Dogs', num(z.total_dogs)],
    ['Cats', num(z.total_cats)],
    ['Licensed pets', num(z.total_licensed)],
    ['Unlicensed pets', num(z.total_unlicensed)],
    ['Cases a month, whole market', num(z.total_cases_per_month)],
    ['Cases a week', num(z.total_cases_per_week)],
    ['Monthly revenue, whole market', rs(z.market_monthly_revenue)],
    ['Monthly revenue, our mix', rs(z.our_monthly_revenue)],
    ['Revenue per visit, our mix', rs(z.our_revenue_per_visit)],
    ['Revenue per route-hour, our mix', rs(z.our_revenue_per_route_hour)],
    ['Revenue one route could carry', rs(z.one_route_monthly_revenue)],
    ['Contribution one route could carry', rs(z.one_route_contribution)],
    ['Mean competition saturation', num(z.saturation_avg, 1)],
    ['Go / Hold / No-Go', `${z.go_count} / ${z.hold_count} / ${z.no_go_count}`],
    ['Busiest hour of the day', `${z.peak_hour}:00`],
  ];
  return table(['Measure', 'Zone ' + zoneLetter], rows);
}

function localityDetailTable(agg, zoneLetter, limit) {
  const list = agg.localities
    .filter((l) => l.zone === zoneLetter)
    .sort((a, b) => a.verdict.rank - b.verdict.rank)
    .slice(0, limit);
  const headers = [
    'Rank',
    'Locality',
    'Ward',
    'Type',
    'Pet households',
    'Cases a month',
    'Peak cases a day',
    'Tier',
  ];
  const rows = list.map((l) => [
    String(l.verdict.rank),
    esc(l.name),
    esc(l.ward || '—'),
    esc(String(l.locality_type || '').replace(/-/g, ' ')),
    num(l.pet_base.pet_households),
    num(l.demand.cases_per_month_total),
    num(l.demand.peak_cases_per_day),
    l.demand.tier,
  ]);
  const money = [
    'Rank',
    'Locality',
    'Avg price, market',
    'Blended, our mix',
    'Revenue a month, our mix',
    'Revenue a Monday, our mix',
    'Rev per route-hour',
    'Saturation',
    'Verdict',
  ];
  const moneyRows = list.map((l) => [
    String(l.verdict.rank),
    esc(l.name),
    rs(l.price.market_mix.avg_visit_price),
    rs(l.price.our_mix.blended_price),
    rs(l.economics.our_mix.monthly_revenue_potential),
    rs(l.economics.our_mix.revenue_per_weekday?.Mon ?? 0),
    rs(l.economics.our_mix.revenue_per_route_hour),
    num(l.competition.saturation_index, 0),
    l.verdict.status,
  ]);
  return { demand: table(headers, rows), money: table(money, moneyRows) };
}

function routeClusterTable(agg) {
  const headers = [
    'Cluster',
    'Zone',
    'Localities',
    'Anchor',
    'Cases a month',
    'Revenue a month, our mix',
    'Contribution one route',
    'Travel between stops',
  ];
  const rows = agg.city.route_clusters.map((c) => [
    esc(c.id),
    c.zone,
    String(c.members),
    esc(c.anchor),
    num(c.cases_per_month),
    rs(c.monthly_revenue),
    rs(c.contribution),
    `${c.travel_min} min`,
  ]);
  return table(
    headers,
    rows,
    { note: 'A cluster is a set of localities one vehicle can serve in a single round trip. Contribution is revenue less the Rs 850 clustered cost of each visit.' }
  );
}

function appendixTable(agg) {
  const list = agg.localities
    .slice()
    .sort((a, b) => a.zone.localeCompare(b.zone) || a.verdict.rank - b.verdict.rank);

  const head = [
    'Zone',
    'Locality',
    'Ward',
    'Type',
    'Households',
    'Pet households',
    'Cases a month',
    'Peak a day',
    'Tier',
  ];
  const headB = [
    'Zone',
    'Locality',
    'Avg price, market',
    'Blended, ours',
    'Revenue a month, ours',
    'Revenue a Monday, ours',
    'Rev per route-hour',
    'Saturation',
    'Verdict',
  ];

  const rowsA = list.map((l) => [
    l.zone,
    esc(l.name),
    esc(l.ward || '—'),
    esc(String(l.locality_type || '').replace(/-/g, ' ')),
    num(l.population.households),
    num(l.pet_base.pet_households),
    num(l.demand.cases_per_month_total),
    num(l.demand.peak_cases_per_day),
    l.demand.tier,
  ]);

  const rowsB = list.map((l) => [
    l.zone,
    esc(l.name),
    rs(l.price.market_mix.avg_visit_price),
    rs(l.price.our_mix.blended_price),
    rs(l.economics.our_mix.monthly_revenue_potential),
    rs(l.economics.our_mix.revenue_per_weekday?.Mon ?? 0),
    rs(l.economics.our_mix.revenue_per_route_hour),
    num(l.competition.saturation_index, 0),
    l.verdict.status,
  ]);

  const note =
    'All one hundred localities. Tier marks how the underlying case count was obtained: A sourced, B derived from sourced inputs, C modelled.';

  return {
    a: table(head, rowsA, { note }),
    b: table(headB, rowsB, { note: 'Revenue a Monday is the Monday figure; the other six days sit within a few percent of it.' }),
  };
}

function staffingTable(agg) {
  const headers = [
    'Hour',
    'Zone A visits a day',
    'Zone A staff',
    'Zone B visits a day',
    'Zone B staff',
    'Both zones staff',
  ];
  const a = agg.zones.find((z) => z.zone === 'A');
  const b = agg.zones.find((z) => z.zone === 'B');
  const rows = [];
  for (let h = 0; h < 24; h++) {
    const key = String(h).padStart(2, '0');
    const ha = a.hourly_plan[h];
    const hb = b.hourly_plan[h];
    const total = ha.visits_per_day + hb.visits_per_day;
    if (total < 0.05 && h < 6) continue;
    rows.push([
      `${key}:00`,
      num(ha.visits_per_day, 1),
      String(ha.staff),
      num(hb.visits_per_day, 1),
      String(hb.staff),
      String(Math.max(ha.staff, hb.staff)),
    ]);
  }
  return table(
    headers,
    rows,
    {
      note: 'Visits a day at the seasonal average, spread across the hour curve. One clinician on a route lands about 1.2 visits an hour once travel between houses is counted, so staff is the ceiling of the workload and never a rounding of it.',
    }
  );
}

function zoneComparisonTable(agg) {
  const a = agg.zones.find((z) => z.zone === 'A');
  const b = agg.zones.find((z) => z.zone === 'B');
  const pick = (z, f) => f(z);
  const higher = (fa, fb) => (fa > fb ? 'Zone A' : fa < fb ? 'Zone B' : 'Level');
  const rows = [
    [
      'Localities scored',
      String(a.locality_count),
      String(b.locality_count),
      '—',
    ],
    ['Households', num(a.total_households), num(b.total_households), higher(a.total_households, b.total_households)],
    ['Pet-owning households', num(a.total_pet_households), num(b.total_pet_households), higher(a.total_pet_households, b.total_pet_households)],
    [
      'Licensed pets',
      num(a.total_licensed),
      num(b.total_licensed),
      higher(a.total_licensed, b.total_licensed),
    ],
    [
      'Unlicensed pets',
      num(a.total_unlicensed),
      num(b.total_unlicensed),
      higher(a.total_unlicensed, b.total_unlicensed),
    ],
    ['Cases a month', num(a.total_cases_per_month), num(b.total_cases_per_month), higher(a.total_cases_per_month, b.total_cases_per_month)],
    [
      'Monthly revenue, our mix',
      rs(a.our_monthly_revenue),
      rs(b.our_monthly_revenue),
      higher(a.our_monthly_revenue, b.our_monthly_revenue),
    ],
    [
      'Monthly revenue, whole market',
      rs(a.market_monthly_revenue),
      rs(b.market_monthly_revenue),
      higher(a.market_monthly_revenue, b.market_monthly_revenue),
    ],
    [
      'One route could carry',
      rs(a.one_route_monthly_revenue),
      rs(b.one_route_monthly_revenue),
      higher(a.one_route_monthly_revenue, b.one_route_monthly_revenue),
    ],
    [
      'Contribution on one route',
      rs(a.one_route_contribution),
      rs(b.one_route_contribution),
      higher(a.one_route_contribution, b.one_route_contribution),
    ],
    [
      'Mean competition saturation',
      num(a.saturation_avg, 1),
      num(b.saturation_avg, 1),
      lowerWins(a.saturation_avg, b.saturation_avg),
    ],
    [
      'Go / Hold / No-Go',
      `${a.go_count} / ${a.hold_count} / ${a.no_go_count}`,
      `${b.go_count} / ${b.hold_count} / ${b.no_go_count}`,
      '—',
    ],
    ['Busiest hour', `${a.peak_hour}:00`, `${b.peak_hour}:00`, '—'],
  ];
  return table(['Measure', 'Zone A', 'Zone B', 'Edge'], rows);
}

function lowerWins(a, b) {
  return a < b ? 'Zone A' : a > b ? 'Zone B' : 'Level';
}

function topLocalitiesTable(agg) {
  const list = agg.localities
    .slice()
    .sort((a, b) => b.economics.our_mix.monthly_revenue_potential - a.economics.our_mix.monthly_revenue_potential)
    .slice(0, 20);
  const headers = [
    'Zone',
    'Locality',
    'Cases a month',
    'Blended, our mix',
    'Margin over Rs 850',
    'Revenue a month',
    'Rev per route-hour',
    'Saturation',
    'Verdict',
  ];
  const rows = list.map((l) => [
    l.zone,
    esc(l.name),
    num(l.demand.cases_per_month_total),
    rs(l.price.our_mix.blended_price),
    rs(l.price.our_mix.blended_price - 850),
    rs(l.economics.our_mix.monthly_revenue_potential),
    rs(l.economics.our_mix.revenue_per_route_hour),
    num(l.competition.saturation_index, 0),
    l.verdict.status,
  ]);
  return table(
    headers,
    rows,
    { note: 'The twenty strongest localities across both corridors, ranked by what our mix could earn in them a month.' }
  );
}

// The decision board: the fifteen route clusters as gates, with the arrow on
// the one to open first. The filters are the reader's; the arrow repaints.
function gatesBlock(agg) {
  const byCluster = new Map();
  for (const l of agg.localities) {
    const id = l.route_cluster || 'unassigned';
    if (!byCluster.has(id)) byCluster.set(id, []);
    byCluster.get(id).push(l);
  }

  const gates = agg.city.route_clusters.map((c, i) => {
    const members = byCluster.get(c.id) || [];
    const go = members.filter((m) => m.verdict.status === 'GO').length;
    const hold = members.filter((m) => m.verdict.status === 'HOLD').length;
    const noGo = members.filter((m) => m.verdict.status === 'NO-GO').length;
    const verdict = noGo > 0 ? 'NO-GO' : hold > 0 ? 'HOLD' : 'GO';
    const tier = members.every((m) => m.demand.tier === 'C')
      ? 'C'
      : members.every((m) => m.demand.tier === 'B')
        ? 'B'
        : 'A';

    // The first gate carries the arrow before any script runs: the board must
    // say where to go even with JavaScript off.
    const arrow = i === 0 ? '<span class="gate__arrow" aria-hidden="true"></span>' : '';

    return `<li class="gate${i === 0 ? ' gate--target' : ''}" data-zone="${esc(c.zone)}" data-verdict="${verdict}" data-tier="${tier}" data-cases="${Math.round(c.cases_per_month)}">
      <span class="gate__id">${esc(c.id)}</span>
      <span class="gate__name"><span>${esc(c.anchor)}</span></span>
      <span class="gate__v"><b>${num(Math.round(c.cases_per_month))}</b><i>cases a month</i></span>
      <span class="gate__v"><b>${rs(c.blended_price)}</b><i>blend</i></span>
      <span class="gate__v"><b>${rs(c.one_route_contribution)}</b><i>one route</i></span>
      ${arrow}
    </li>`;
  });

  // One HTML block, no blank lines inside it: a blank line would end the block
  // and Markdown would escape the rest as text.
  return `<div class="board" id="board">
  <div class="board__head">
    <span class="board__k">The decision board, fifteen gates</span>
    <span class="board__note">Each gate is a route cluster: a round one vehicle can serve. The arrow points at the gate to open first.</span>
  </div>
  <div class="board__filters">
    <label>Zone <select data-filter="zone"><option value="">Both</option><option value="A">Zone A</option><option value="B">Zone B</option></select></label>
    <label>Verdict <select data-filter="verdict"><option value="">All</option><option value="GO">Go</option><option value="HOLD">Hold</option><option value="NO-GO">No-go</option></select></label>
    <label>Tier <select data-filter="tier"><option value="">All</option><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></label>
  </div>
  <ol class="gates">${gates.join('')}</ol>
</div>`.replace(/\n\s*\n/g, '\n');
}

function tierLegendTable(agg) {
  const rows = agg.localities.map((l) => l.demand.tier);
  const counts = rows.reduce((acc, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {});
  return table(
    ['Tier', 'Localities', 'What it means'],
    [
      ['A', String(counts.A || 0), 'The figure comes from a page or document that was actually loaded, and the source is listed.'],
      ['B', String(counts.B || 0), 'The quantity is computed from sourced inputs by a formula stated in the model note, and the rate applied to it is modelled.'],
      ['C', String(counts.C || 0), 'The quantity is modelled. The assumption and its uncertainty band are stated in the model note.'],
    ]
  );
}

// ---- assembly --------------------------------------------------------------

export function dossierBlocks(agg) {
  const appendix = appendixTable(agg);
  const a = localityDetailTable(agg, 'A', 12);
  const b = localityDetailTable(agg, 'B', 12);
  return {
    'table:zone-a-scorecard': zoneScorecard(agg, 'A'),
    'table:zone-b-scorecard': zoneScorecard(agg, 'B'),
    'table:zone-a-localities': a.demand,
    'table:zone-a-money': a.money,
    'table:zone-b-localities': b.demand,
    'table:zone-b-money': b.money,
    'table:route-clusters': routeClusterTable(agg),
    'table:appendix-a': appendix.a,
    'table:appendix-b': appendix.b,
    'table:tier-legend': tierLegendTable(agg),
    'table:staffing-plan': staffingTable(agg),
    'table:zone-comparison': zoneComparisonTable(agg),
    'table:top-localities': topLocalitiesTable(agg),
    'board:gates': gatesBlock(agg),
    'chart:hour-curve': hourCurveChart(agg),
    'chart:weekday': weekdayChart(agg),
    'chart:seasonality': seasonChart(agg),
    'chart:revenue-ranking': revenueChart(agg),
  };
}

export function injectBlocks(bodyMd, agg) {
  const blocks = dossierBlocks(agg);
  const missing = [];
  const out = bodyMd.replace(/\{\{(table|chart|board):([a-z0-9-]+)\}\}/g, (m, kind, name) => {
    const key = `${kind}:${name}`;
    if (!(key in blocks)) {
      missing.push(key);
      return '';
    }
    return `\n\n${blocks[key]}\n\n`;
  });
  return { out, missing };
}
