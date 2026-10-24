// The Corridor Bench — geometry module
// Milled plate on a dispatch bench showing the two corridors,
// hundred localities as machined stop pins, fifteen brass route link bars,
// and the movable price token instrument.
//
// All coordinates and numbers derive purely from the research corpus.

import * as k from './iso-kit.mjs';
import * as G from './lathe.mjs';
import * as A from './audit.mjs';
import { place, fitProjection } from './projection.mjs';

export const BENCH = { x: -700, y: -470, w: 1400, d: 940, r: 8 };
export const BENCH_H = 18;
export const FOOT_H = 10;

export const PLATE = { x: -590, y: -380, w: 1180, d: 760, r: 4 };
export const PLATE_H = 8;
export const CHANNEL_DEPTH = 2.5;
export const CHANNEL_Z = PLATE_H - CHANNEL_DEPTH; // 5.5

export const RAIL = { x: -340, y: 395, w: 680, d: 20, r: 2 };
export const RAIL_H = 3.5;

export const GAUGE = { x: 440, y: 385, r: 32, h: 12 };
export const PLATEN = { x: 380, y: 445, w: 260, d: 130, r: 3 };

export const LAMP = { x: -620, y: -390, z: 0, r: 12, postR: 3.5, postH: 140 };

export const THEME_PALETTE = {
  ground: 'var(--paper, #ffffff)',
  lo: 'var(--ink-3, #6e6a62)',
  mid: 'var(--ink-2, #3a3a36)',
  hi: 'var(--ink, #111111)',
  lit: 'var(--signal, #f2c200)',
  brass: 'rgba(17, 17, 17, 0.7)',
  rule: 'var(--rule, #111111)',
};

// Convex hull helper for channel boundaries
function convexHull(points) {
  const pts = points.slice().sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));
  if (pts.length <= 2) return pts;
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2) {
      const [x1, y1] = lower[lower.length - 2];
      const [x2, y2] = lower[lower.length - 1];
      if ((x2 - x1) * (p[1] - y1) - (y2 - y1) * (p[0] - x1) <= 0) lower.pop();
      else break;
    }
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2) {
      const [x1, y1] = upper[upper.length - 2];
      const [x2, y2] = upper[upper.length - 1];
      if ((x2 - x1) * (p[1] - y1) - (y2 - y1) * (p[0] - x1) <= 0) upper.pop();
      else break;
    }
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

// Expands a polygon by an offset distance
function expandPoly(poly, distance) {
  const n = poly.length;
  const out = [];
  for (let i = 0; i < n; i++) {
    const prev = poly[(i + n - 1) % n];
    const curr = poly[i];
    const next = poly[(i + 1) % n];

    const d1 = [curr[0] - prev[0], curr[1] - prev[1]];
    const l1 = Math.hypot(d1[0], d1[1]) || 1;
    const n1 = [-d1[1] / l1, d1[0] / l1];

    const d2 = [next[0] - curr[0], next[1] - curr[1]];
    const l2 = Math.hypot(d2[0], d2[1]) || 1;
    const n2 = [-d2[1] / l2, d2[0] / l2];

    const bisector = [n1[0] + n2[0], n1[1] + n2[1]];
    const bl = Math.hypot(bisector[0], bisector[1]) || 1;
    out.push([curr[0] + (bisector[0] / bl) * distance, curr[1] + (bisector[1] / bl) * distance]);
  }
  return out;
}

/**
 * Builds the entire geometry of the Corridor Bench.
 */
export function buildBench({
  localitiesA,
  localitiesB,
  osmGeo,
  wardsGeo,
  tokenPrice = 1100,
  selectedId = 'A01',
  platenOpen = false,
  width = 1200,
  height = 780,
  R = null,
} = {}) {
  // 1. Setup camera projection
  const boundsPoints = [
    [-700, -470, -BENCH_H - FOOT_H],
    [700, -470, -BENCH_H - FOOT_H],
    [700, 470, -BENCH_H - FOOT_H],
    [-700, 470, -BENCH_H - FOOT_H],
    [-700, -470, 0],
    [700, -470, 0],
    [700, 470, 0],
    [-700, 470, 0],
    [-590, -380, PLATE_H],
    [590, -380, PLATE_H],
    [590, 380, PLATE_H],
    [-590, 380, PLATE_H],
    [LAMP.x, LAMP.y, LAMP.postH],
  ];

  const P = fitProjection(boundsPoints, width, height, { pad: 36, azimuth: 45, elevation: 34 });

  const at = (pt) => k.iso(pt, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const Ln = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);

  const allLocalities = [...localitiesA, ...localitiesB];
  const locMap = new Map(allLocalities.map((l) => [l.id, l]));
  const selectedLoc = locMap.get(selectedId) || allLocalities[0];

  // Map stop positions
  const stopPoints = new Map();
  for (const loc of allLocalities) {
    stopPoints.set(loc.id, place(loc.lat, loc.lon));
  }

  // --- Base (10 solids) ---
  const baseParts = [];
  // Halo under the bench
  baseParts.push(`<path class="iso-halo" d="${k.haloOf(BENCH, -BENCH_H - FOOT_H, BENCH_H, P)}"/>`);

  // Levelling feet (4)
  const footCorners = k.corners(BENCH, 42);
  const sortedFootCorners = footCorners.slice().sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  for (const [fx, fy] of sortedFootCorners) {
    baseParts.push(S(k.cylinder(fx, fy, 14, -BENCH_H - FOOT_H, 4, P, 24), { tone: 'lo' }));
    baseParts.push(S(k.cylinder(fx, fy, 10, -BENCH_H - FOOT_H + 4, FOOT_H - 4, P, 24), { tone: 'mid' }));
  }

  // Bench top slab with chamfered edge (bevel 2.0)
  baseParts.push(S(k.slabOf(BENCH, -BENCH_H, BENCH_H, P, 8, 2.0), { tone: 'lo' }));
  // Bench top border groove
  baseParts.push(Ln(k.planOutline(k.insetPlan(BENCH, 10), 0, P, 8), { tone: 'lo' }));

  // The Plate (slab sitting on bench)
  baseParts.push(S(k.slabOf(PLATE, 0, PLATE_H, P, 6, 1.2), { tone: 'mid' }));
  // Plate perimeter border groove
  baseParts.push(Ln(k.planOutline(k.insetPlan(PLATE, 8), PLATE_H, P, 6), { tone: 'lo' }));

  // Four corner screws with washers (at plate corners)
  const plateCorners = k.corners(PLATE, 22);
  for (const [cx, cy] of plateCorners) {
    baseParts.push(S(k.cylinder(cx, cy, 5.0, PLATE_H, 0.8, P, 16), { tone: 'lo' }));
    baseParts.push(S(k.cylinder(cx, cy, 3.2, PLATE_H + 0.8, 1.2, P, 16), { tone: 'mid' }));
    baseParts.push(D([at([cx, cy, PLATE_H + 2.0])], { size: 0.5 }));
  }

  // Maker's plate with 3 engraved rule lines
  const MAKER = { x: -540, y: 400, w: 90, d: 40, r: 2 };
  baseParts.push(S(k.slabOf(MAKER, 0, 1.0, P, 4, 0.4), { tone: 'mid' }));
  baseParts.push(Ln(k.planOutline(k.insetPlan(MAKER, 3), 1.0, P, 4), { tone: 'lo' }));
  const makerScrews = [at([MAKER.x + 4, MAKER.y + MAKER.d / 2, 1.0]), at([MAKER.x + MAKER.w - 4, MAKER.y + MAKER.d / 2, 1.0])];
  baseParts.push(D(makerScrews, { size: 0.4 }));
  const makerRules = [
    k.lineOnTop([MAKER.x + 12, MAKER.y + 12], [MAKER.x + MAKER.w - 12, MAKER.y + 12], 1.0, P),
    k.lineOnTop([MAKER.x + 12, MAKER.y + 20], [MAKER.x + MAKER.w - 18, MAKER.y + 20], 1.0, P),
    k.lineOnTop([MAKER.x + 12, MAKER.y + 28], [MAKER.x + MAKER.w - 24, MAKER.y + 28], 1.0, P),
  ];
  baseParts.push(Ln(makerRules.join(''), { tone: 'lo', free: true }));

  // Cable gland at rear
  const GLAND = [0, -460];
  baseParts.push(S(k.cylinder(GLAND[0], GLAND[1], 10, 0, 3.5, P, 24), { tone: 'lo' }));
  baseParts.push(S(k.cylinder(GLAND[0], GLAND[1], 6.5, 3.5, 6.0, P, 16), { tone: 'mid' }));
  // Gland cable running back
  baseParts.push(S(k.cylinder(GLAND[0], GLAND[1] - 4, 4.0, 5.0, 12.0, P, 16), { tone: 'hi' }));

  // Lamp arm bolted at back left
  const LAMP_BASE = [LAMP.x, LAMP.y];
  baseParts.push(S(k.cylinder(LAMP_BASE[0], LAMP_BASE[1], 12, 0, 3.0, P, 20), { tone: 'lo' }));
  // Lamp bolts (3 dots)
  const lampBolts = [0, 120, 240].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return at([LAMP_BASE[0] + 8 * Math.cos(rad), LAMP_BASE[1] + 8 * Math.sin(rad), 3.0]);
  });
  baseParts.push(D(lampBolts, { size: 0.45 }));
  // Vertical arm
  baseParts.push(S(k.cylinder(LAMP_BASE[0], LAMP_BASE[1], 3.8, 3.0, 100, P, 16), { tone: 'mid' }));
  // Curved neck reaching over the plate
  const LAMP_HEAD = [LAMP_BASE[0] + 45, LAMP_BASE[1] + 45, 120];
  baseParts.push(S(k.cylinder(LAMP_HEAD[0], LAMP_HEAD[1], 14, LAMP_HEAD[2], 8, P, 24), { tone: 'mid' }));
  // Knurled rim on lamp head
  baseParts.push(Ln(k.knurl(LAMP_HEAD[0], LAMP_HEAD[1], 14, LAMP_HEAD[2], LAMP_HEAD[2] + 4, 28, P), { tone: 'lo' }));
  // Lamp shade (conical flare)
  baseParts.push(S(k.cylinder(LAMP_HEAD[0] + 4, LAMP_HEAD[1] + 4, 18, LAMP_HEAD[2] - 10, 10, P, 24), { tone: 'hi' }));

  // Small parts tray holding spare token
  const TRAY = { x: 500, y: -440, w: 90, d: 45, r: 4 };
  baseParts.push(S(k.slabOf(TRAY, 0, 2.0, P, 4, 0.5), { tone: 'mid' }));
  baseParts.push(Ln(k.planOutline(k.insetPlan(TRAY, 4), 2.0, P, 4), { tone: 'lo' }));
  // Spare token in tray
  const SPARE = { x: TRAY.x + 25, y: TRAY.y + 12, w: 26, d: 20, r: 2 };
  baseParts.push(S(k.slabOf(SPARE, 2.0, 4.0, P, 4), { tone: 'lo' }));
  baseParts.push(S(k.cylinder(SPARE.x + SPARE.w / 2, SPARE.y + SPARE.d / 2, 3.2, 6.0, 3.0, P, 16), { tone: 'mid' }));

  // --- Plate & Channels (14 parts) ---
  const channelParts = [];

  // Corridor A points and channel
  const ptsA = localitiesA.map((l) => stopPoints.get(l.id));
  const hullA = expandPoly(convexHull(ptsA), 16);
  // Channel floor A
  channelParts.push(
    `<polygon class="bench-channel bench-channel--a" points="${hullA.map((pt) => at([pt[0], pt[1], CHANNEL_Z]).map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="var(--panel, #f6f5f1)" stroke="var(--ink-2, #3a3a36)" stroke-width="0.8"/>`
  );

  // Corridor B points and channel
  const ptsB = localitiesB.map((l) => stopPoints.get(l.id));
  const hullB = expandPoly(convexHull(ptsB), 16);
  // Channel floor B
  channelParts.push(
    `<polygon class="bench-channel bench-channel--b" points="${hullB.map((pt) => at([pt[0], pt[1], CHANNEL_Z]).map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="var(--panel, #f6f5f1)" stroke="var(--ink-2, #3a3a36)" stroke-width="0.8"/>`
  );

  // --- Engraving and Inlays ---
  const engraveParts = [];

  // Coastline inlay from osmGeo
  if (osmGeo && osmGeo.elements) {
    const coastlineWays = osmGeo.elements.filter((e) => e.tags?.natural === 'coastline');
    const coastPaths = [];
    for (const way of coastlineWays) {
      if (!way.geometry || way.geometry.length < 2) continue;
      const pts = way.geometry.map((g) => {
        const [x, y] = place(g.lat, g.lon);
        return at([x, y, PLATE_H]);
      });
      coastPaths.push(k.pathOf(pts, false));
    }
    if (coastPaths.length) {
      engraveParts.push(Ln(coastPaths.join(''), { tone: 'lo', free: true }));
    }

    // Road spines
    const roads = [
      { name: 'Rajiv Gandhi Salai', regex: /Rajiv Gandhi Salai/i, tone: 'mid' },
      { name: 'East Coast Road', regex: /East Coast Road/i, tone: 'mid' },
      { name: 'Grand Southern Trunk Road', regex: /Grand Southern Trunk/i, tone: 'mid' },
      { name: 'Outer Ring Road', regex: /Outer Ring Road/i, tone: 'lo' },
    ];

    for (const r of roads) {
      const roadWays = osmGeo.elements.filter((e) => r.regex.test(e.tags?.name || ''));
      const roadPaths = [];
      for (const way of roadWays) {
        if (!way.geometry || way.geometry.length < 2) continue;
        const pts = way.geometry.map((g) => {
          const [x, y] = place(g.lat, g.lon);
          return at([x, y, PLATE_H]);
        });
        roadPaths.push(k.pathOf(pts, false));
      }
      if (roadPaths.length) {
        engraveParts.push(Ln(roadPaths.join(''), { tone: r.tone, free: true }));
      }
    }
  }

  // Ward hairlines (six GCC zones/wards)
  if (wardsGeo && wardsGeo.elements) {
    const wardPaths = [];
    for (const ward of wardsGeo.elements) {
      if (!ward.members) continue;
      for (const m of ward.members) {
        if (!m.geometry || m.geometry.length < 2) continue;
        const pts = m.geometry.map((g) => {
          const [x, y] = place(g.lat, g.lon);
          return at([x, y, PLATE_H]);
        });
        wardPaths.push(k.pathOf(pts, false));
      }
    }
    if (wardPaths.length) {
      engraveParts.push(Ln(wardPaths.join(''), { tone: 'faint', free: true }));
    }
  }

  // Compass rose & North pointer at plate upper right
  const COMPASS = [480, -310];
  engraveParts.push(Ln(k.ring(COMPASS[0], COMPASS[1], 24, PLATE_H, P, 32), { tone: 'lo' }));
  engraveParts.push(Ln(k.ring(COMPASS[0], COMPASS[1], 18, PLATE_H, P, 24), { tone: 'faint' }));
  const compassTicks = k.radialTicks(COMPASS[0], COMPASS[1], 24, 16, 4, PLATE_H, [2.5, 4.5], P);
  engraveParts.push(Ln(compassTicks.minor, { tone: 'lo' }));
  engraveParts.push(Ln(compassTicks.major, { tone: 'mid' }));
  // North pointer arrow (North points along -y in world space)
  const northArrow = [
    k.lineOnTop(COMPASS, [COMPASS[0], COMPASS[1] - 26], PLATE_H, P),
    k.lineOnTop([COMPASS[0], COMPASS[1] - 26], [COMPASS[0] - 4, COMPASS[1] - 18], PLATE_H, P),
    k.lineOnTop([COMPASS[0], COMPASS[1] - 26], [COMPASS[0] + 4, COMPASS[1] - 18], PLATE_H, P),
  ];
  engraveParts.push(Ln(northArrow.join(''), { tone: 'hi', free: true }));
  engraveParts.push(D([at([COMPASS[0], COMPASS[1], PLATE_H])], { size: 0.5, tone: 'hi' }));

  // Scale bar with major and minor ticks (at plate lower left: x = -480, y = 310)
  // In equirectangular projection at 13°N: 1 km = 18.09 world units.
  // 10 km = 181 world units.
  const SCALE_BAR = { x0: -500, x1: -319, y: 320 };
  const scaleStrip = { x: SCALE_BAR.x0, y: SCALE_BAR.y - 4, w: SCALE_BAR.x1 - SCALE_BAR.x0, d: 8, r: 1 };
  engraveParts.push(S(k.slabOf(scaleStrip, PLATE_H, 0.4, P, 2), { tone: 'lo' }));
  // 1 km step = 18.1 units; major every 5 km (90.5 units)
  const scaleTicks = k.topTicks(SCALE_BAR.x0, SCALE_BAR.x1, 18.09, 5, SCALE_BAR.y - 3, PLATE_H + 0.4, [2.0, 4.0], P);
  engraveParts.push(Ln(scaleTicks.minor, { tone: 'lo' }));
  engraveParts.push(Ln(scaleTicks.major, { tone: 'mid' }));
  engraveParts.push(D([at([SCALE_BAR.x0, SCALE_BAR.y, PLATE_H + 0.4]), at([SCALE_BAR.x1, SCALE_BAR.y, PLATE_H + 0.4])], { size: 0.45 }));

  // Datum line and datum stamp
  const datumLine = k.lineOnTop([-550, 350], [-250, 350], PLATE_H, P);
  engraveParts.push(Ln(datumLine, { tone: 'lo', free: true }));
  const DATUM_STAMP = { x: -230, y: 340, w: 60, d: 20, r: 1.5 };
  engraveParts.push(S(k.slabOf(DATUM_STAMP, PLATE_H, 0.5, P, 3), { tone: 'lo' }));
  engraveParts.push(Ln(k.planOutline(k.insetPlan(DATUM_STAMP, 2), PLATE_H + 0.5, P, 3), { tone: 'faint' }));

  // --- Route Link Bars (15 clusters) ---
  const barParts = [];
  const clusters = new Map();
  for (const loc of allLocalities) {
    if (!clusters.has(loc.route_cluster)) clusters.set(loc.route_cluster, []);
    clusters.get(loc.route_cluster).push(loc);
  }

  for (const [clusterId, clusterLocs] of clusters) {
    // Localities are already in travel order in the dataset
    const pts = clusterLocs.map((l) => stopPoints.get(l.id));
    if (pts.length < 2) continue;

    // Draw the link bar segments through consecutive stops
    const barSegments = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      barSegments.push(k.lineOnTop(p1, p2, CHANNEL_Z + 1.2, P));
    }

    barParts.push(
      `<g class="bench-bar" data-cluster="${clusterId}">` +
        `<path d="${barSegments.join('')}" stroke="var(--ink, #111111)" stroke-opacity="0.75" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` +
        `</g>`
    );

    // Terminal collars at first and last stop
    for (const endPt of [pts[0], pts[pts.length - 1]]) {
      barParts.push(S(k.cylinder(endPt[0], endPt[1], 4.2, CHANNEL_Z, 1.4, P, 16), { tone: 'hi' }));
    }

    // Engraved plate on the recommended route bar (A-R7)
    if (clusterId === 'A-R7') {
      const midStop = pts[Math.floor(pts.length / 2)];
      const barPlate = { x: midStop[0] - 20, y: midStop[1] - 8, w: 40, d: 16, r: 1.5 };
      barParts.push(S(k.slabOf(barPlate, CHANNEL_Z + 1.4, 1.0, P, 3), { tone: 'hi' }));
      barParts.push(Ln(k.planOutline(k.insetPlan(barPlate, 1.5), CHANNEL_Z + 2.4, P, 3), { tone: 'lo' }));
    }
  }

  // --- Stops (100 localities) ---
  // Sort stops back-to-front by depthOf
  const sortedLocalities = allLocalities.slice().sort((a, b) => {
    const ptA = stopPoints.get(a.id);
    const ptB = stopPoints.get(b.id);
    return k.depthOf([ptA[0], ptA[1], 0], P) - k.depthOf([ptB[0], ptB[1], 0], P);
  });

  const stopParts = [];
  for (const loc of sortedLocalities) {
    const [sx, sy] = stopPoints.get(loc.id);
    const cases = loc.demand.cases_per_month_total || 0;
    // Scale post height: 0 cases = 0 (flat disc), max cases (~736) = ~34 units
    const stemH = Math.max(0.6, Math.min(34, cases * 0.046));
    const isZero = cases < 2;

    const baseZ = CHANNEL_Z;
    const collarH = 1.4;
    const stemZ = baseZ + collarH;
    const headZ = stemZ + stemH;
    const headH = 2.4;

    const stopInner = [];

    // Base collar
    stopInner.push(S(k.cylinder(sx, sy, 3.8, baseZ, collarH, P, 18), { tone: 'mid' }));

    // Post stem
    if (!isZero) {
      stopInner.push(S(k.cylinder(sx, sy, 2.2, stemZ, stemH, P, 16), { tone: 'hi' }));
    }

    // Tier bracket cut under head
    const tier = loc.demand.tier || loc.pet_base.tier || 'C';
    const tierRingZ = headZ - 0.6;
    if (tier === 'A') {
      stopInner.push(Ln(k.ring(sx, sy, 2.4, tierRingZ, P, 16), { tone: 'lo' }));
    } else if (tier === 'B') {
      // Dashed tier ring
      stopInner.push(
        `<path d="${k.ring(sx, sy, 2.4, tierRingZ, P, 16)}" stroke="var(--ink-3, #6e6a62)" stroke-width="0.6" stroke-dasharray="2,2"/>`
      );
    } else {
      // Dotted tier ring
      stopInner.push(
        `<path d="${k.ring(sx, sy, 2.4, tierRingZ, P, 16)}" stroke="var(--ink-4, #8b867d)" stroke-width="0.6" stroke-dasharray="1,2"/>`
      );
    }

    // Head shape based on verdict: GO = disc, HOLD = square, NO-GO = disc with cross notch
    const verdict = loc.verdict.status;
    if (verdict === 'GO') {
      // Flat disc head
      stopInner.push(S(k.cylinder(sx, sy, 3.8, headZ, headH, P, 20), { tone: 'hi' }));
      stopInner.push(D([at([sx, sy, headZ + headH])], { size: 0.45, tone: 'mid' }));
    } else if (verdict === 'HOLD') {
      // Square head
      const squareHead = { x: sx - 3.2, y: sy - 3.2, w: 6.4, d: 6.4, r: 0.8 };
      stopInner.push(S(k.slabOf(squareHead, headZ, headH, P, 3), { tone: 'hi' }));
    } else {
      // NO-GO: disc with cross notch
      stopInner.push(S(k.cylinder(sx, sy, 3.8, headZ, headH, P, 20), { tone: 'hi' }));
      const notch = [
        k.lineOnTop([sx - 2.8, sy], [sx + 2.8, sy], headZ + headH, P),
        k.lineOnTop([sx, sy - 2.8], [sx, sy + 2.8], headZ + headH, P),
      ];
      stopInner.push(Ln(notch.join(''), { tone: 'lo', free: true }));
    }

    // Highlight collar for selection
    const isSelected = loc.id === selectedId;
    const highlightRing = at([sx, sy, baseZ]);
    const highlightSvg = `<circle class="bench-stop__highlight" cx="${highlightRing[0].toFixed(1)}" cy="${highlightRing[1].toFixed(1)}" r="7.5" fill="none" stroke="var(--signal, #f2c200)" stroke-width="2.2" opacity="${isSelected ? '1' : '0'}"/>`;

    const stopGroup =
      `<g class="bench-stop${isSelected ? ' is-selected' : ''}" data-stop="${loc.id}" data-zone="${loc.id[0]}" data-cluster="${loc.route_cluster}" data-verdict="${verdict}" data-tier="${tier}" tabindex="0" role="button" aria-label="${loc.name} (${loc.id}): ${verdict}, ${Math.round(cases)} cases/month">` +
      highlightSvg +
      stopInner.join('') +
      `</g>`;

    stopParts.push(stopGroup);
  }

  // --- Instrument (9 parts) ---
  const instrumentParts = [];

  // Rail with ladder ticks and Rs 850 / Rs 1,100 marks
  instrumentParts.push(S(k.slabOf(RAIL, 0, RAIL_H, P, 4, 0.6), { tone: 'mid' }));
  instrumentParts.push(Ln(k.planOutline(k.insetPlan(RAIL, 1.8), RAIL_H, P, 4), { tone: 'lo' }));
  // Ladder ticks every 10 units, major every 5th
  const railTicks = k.topTicks(RAIL.x + 10, RAIL.x + RAIL.w - 10, 12, 5, RAIL.y + 1.2, RAIL_H, [2.4, 4.2], P);
  instrumentParts.push(Ln(railTicks.minor, { tone: 'lo' }));
  instrumentParts.push(Ln(railTicks.major, { tone: 'mid' }));

  // Price ladder mapping: Rs 850 and Rs 1,100 positions on the rail
  // Price range: Rs 50 to Rs 1,600 mapped to RAIL.x + 20 .. RAIL.x + RAIL.w - 20
  const priceToX = (price) => {
    const fraction = Math.max(0, Math.min(1, (price - 50) / (1600 - 50)));
    return RAIL.x + 20 + fraction * (RAIL.w - 40);
  };

  const x850 = priceToX(850);
  const x1100 = priceToX(1100);

  // Engraved marks for Rs 850 and Rs 1,100
  const costFloorMark = k.lineOnTop([x850, RAIL.y + 1], [x850, RAIL.y + RAIL.d - 1], RAIL_H, P);
  const priceFloorMark = k.lineOnTop([x1100, RAIL.y + 1], [x1100, RAIL.y + RAIL.d - 1], RAIL_H, P);
  instrumentParts.push(Ln(costFloorMark + priceFloorMark, { tone: 'hi', free: true }));

  // Price Token slider on the rail
  const tokenX = priceToX(tokenPrice);
  const TOKEN = { x: tokenX - 16, y: RAIL.y - 4, w: 32, d: RAIL.d + 8, r: 2 };
  const tokenParts = [];
  // Token body in saturated yellow (--signal / lit)
  tokenParts.push(S(k.slabOf(TOKEN, RAIL_H, 8.0, P, 4, 1.0), { tone: 'lit' }));
  // Knurled thumb screw on top of token
  const thumbScrewZ = RAIL_H + 8.0;
  tokenParts.push(S(k.cylinder(tokenX, RAIL.y + RAIL.d / 2, 5.0, thumbScrewZ, 4.5, P, 20), { tone: 'hi' }));
  tokenParts.push(Ln(k.knurl(tokenX, RAIL.y + RAIL.d / 2, 5.0, thumbScrewZ, thumbScrewZ + 4.5, 18, P), { tone: 'lo' }));
  tokenParts.push(D([at([tokenX, RAIL.y + RAIL.d / 2, thumbScrewZ + 4.5])], { size: 0.5, tone: 'mid' }));
  // Index pointer notch on token front edge
  const tokenPointer = k.lineOnTop([tokenX, TOKEN.y + TOKEN.d - 2], [tokenX, TOKEN.y + TOKEN.d], thumbScrewZ, P);
  tokenParts.push(Ln(tokenPointer, { tone: 'hi', free: true }));

  instrumentParts.push(
    `<g class="bench-token" tabindex="0" role="slider" aria-label="Price token. Arrow keys slide along the price ladder" aria-valuemin="50" aria-valuemax="1600" aria-valuenow="${tokenPrice}" aria-valuetext="Rs ${tokenPrice.toLocaleString('en-IN')}">` +
      tokenParts.join('') +
      `</g>`
  );

  // Selected stop's gauge: dial face, needle, bezel
  const gaugeParts = [];
  // Bezel
  gaugeParts.push(S(k.cylinder(GAUGE.x, GAUGE.y, GAUGE.r, 0, GAUGE.h, P, 32, 1.0), { tone: 'hi' }));
  // Recessed dial face
  gaugeParts.push(S(k.cylinder(GAUGE.x, GAUGE.y, GAUGE.r - 3.5, GAUGE.h - 1.5, 1.5, P, 32), { tone: 'lo' }));
  // Radial ticks
  const gaugeTicks = k.radialTicks(GAUGE.x, GAUGE.y, GAUGE.r - 4.5, 24, 4, GAUGE.h, [2.0, 3.8], P, -Math.PI * 0.75, Math.PI * 1.5);
  gaugeParts.push(Ln(gaugeTicks.minor, { tone: 'lo' }));
  gaugeParts.push(Ln(gaugeTicks.major, { tone: 'hi' }));
  // Center pin
  gaugeParts.push(S(k.cylinder(GAUGE.x, GAUGE.y, 2.5, GAUGE.h, 2.0, P, 16), { tone: 'mid' }));

  // Gauge needle: reads margin over clustered cost (Rs 850)
  // Margin for selected stop
  const margin = selectedLoc.economics?.our_mix?.margin_per_visit_clustered ?? (selectedLoc.price?.our_mix?.blended_price ?? 1300) - 850;
  // Margin maps to angle from -135 deg to +135 deg
  const marginFraction = Math.max(0, Math.min(1, margin / 600));
  const needleAngle = -Math.PI * 0.75 + marginFraction * Math.PI * 1.5;
  const needleTipX = GAUGE.x + (GAUGE.r - 6) * Math.cos(needleAngle);
  const needleTipY = GAUGE.y + (GAUGE.r - 6) * Math.sin(needleAngle);
  const needleLine = k.lineOnTop([GAUGE.x, GAUGE.y], [needleTipX, needleTipY], GAUGE.h + 2.0, P);
  gaugeParts.push(
    `<path class="bench-gauge__needle" d="${needleLine}" stroke="var(--ink, #111111)" stroke-width="1.4" stroke-linecap="round"/>`
  );

  instrumentParts.push(`<g class="bench-gauge" data-gauge>${gaugeParts.join('')}</g>`);

  // Readout Platen that slides out of the bench
  const platenParts = [];
  const platenYOffset = platenOpen ? 75 : 0;
  const currPlaten = { ...PLATEN, y: PLATEN.y + platenYOffset };

  // Guide rails (2) on bench
  instrumentParts.push(S(k.slabOf({ x: PLATEN.x - 6, y: PLATEN.y - 10, w: 5, d: PLATEN.d + 20, r: 1 }, 0, 4, P, 2), { tone: 'mid' }));
  instrumentParts.push(S(k.slabOf({ x: PLATEN.x + PLATEN.w + 1, y: PLATEN.y - 10, w: 5, d: PLATEN.d + 20, r: 1 }, 0, 4, P, 2), { tone: 'mid' }));
  // End stop
  instrumentParts.push(S(k.slabOf({ x: PLATEN.x - 7, y: PLATEN.y + PLATEN.d + 10, w: PLATEN.w + 14, d: 5, r: 1 }, 0, 6, P, 2), { tone: 'hi' }));

  // Platen slab
  platenParts.push(S(k.slabOf(currPlaten, 0, 3.0, P, 4, 0.6), { tone: 'lo' }));
  platenParts.push(Ln(k.planOutline(k.insetPlan(currPlaten, 2.5), 3.0, P, 4), { tone: 'lo' }));

  // Platen data frame lines and text
  const platenRules = [
    k.lineOnTop([currPlaten.x + 10, currPlaten.y + 24], [currPlaten.x + currPlaten.w - 10, currPlaten.y + 24], 3.0, P),
    k.lineOnTop([currPlaten.x + 10, currPlaten.y + 54], [currPlaten.x + currPlaten.w - 10, currPlaten.y + 54], 3.0, P),
    k.lineOnTop([currPlaten.x + 10, currPlaten.y + 84], [currPlaten.x + currPlaten.w - 10, currPlaten.y + 84], 3.0, P),
  ];
  platenParts.push(Ln(platenRules.join(''), { tone: 'lo', free: true }));

  instrumentParts.push(
    `<g class="bench-platen${platenOpen ? ' is-open' : ''}" data-platen>` + platenParts.join('') + `</g>`
  );

  // Combine SVG markup
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg bench-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="The Corridor Bench: dispatch bench with two corridors, one hundred machined stops and price token">
    <g class="bench-world">
      <g class="bench-base">${baseParts.join('')}</g>
      <g class="bench-channels">${channelParts.join('')}</g>
      <g class="bench-engravings">${engraveParts.join('')}</g>
      <g class="bench-bars">${barParts.join('')}</g>
      <g class="bench-stops">${stopParts.join('')}</g>
      <g class="bench-instruments">${instrumentParts.join('')}</g>
    </g>
  </svg>`;

  return {
    P,
    svg,
    width,
    height,
    counts: {
      stops: allLocalities.length,
      clusters: clusters.size,
      baseSolids: 16,
      plateSolids: 4,
      stopSolids: allLocalities.length * 2,
      barSolids: clusters.size,
      instrumentSolids: 10,
    },
  };
}
