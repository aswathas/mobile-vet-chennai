// Pure projection module for the Corridor Bench.
// Maps geographic coordinates (lat, lon) in Chennai to world coordinates (x, y)
// on the milled dispatch bench plate (1180 x 760 units).
//
// Equirectangular projection with cos(lat) correction at 13°N.
// Fitted to the plate bounds. Not a survey; a placement.

import { fitProjection as fitIsoProjection } from './iso-kit.mjs';
import { fileURLToPath } from 'node:url';

export const LAT_REF = 13.0; // 13°N
export const RADIANS = Math.PI / 180;
export const COS_LAT = Math.cos(LAT_REF * RADIANS);

// Center and scale chosen so all 100 localities fit comfortably within the 1180 x 760 plate.
// Longitude range: 79.73719 to 80.26442
// Latitude range: 12.83800 to 13.03479
export const LON_0 = 80.000805;
export const LAT_0 = 12.936395;
export const SCALE = 2000;

/**
 * Maps geographic coordinates (lat, lon) to world units [x, y] on the plate.
 * +x points East (towards the coastal corridor and right of screen)
 * -x points West (towards Parandur and left of screen)
 * -y points North (towards Thiruvanmiyur/Adyar and top/back of screen)
 * +y points South (towards Navalur/Kelambakkam and front of screen)
 */
export function place(lat, lon) {
  const x = (lon - LON_0) * COS_LAT * SCALE;
  const y = -(lat - LAT_0) * SCALE;
  return [x, y];
}

/**
 * Fits a 3D isometric camera projection for the figure.
 * Camera is azimuth 45°, elevation 34° as specified in the contract.
 */
export function fitProjection(points, width, height, opts = {}) {
  return fitIsoProjection(points, width, height, {
    azimuth: 45,
    elevation: 34,
    pad: 32,
    ...opts,
  });
}

/**
 * Verification self-check: proves a known point lands on its exact coordinate.
 */
export function selfCheck() {
  const [cx, cy] = place(LAT_0, LON_0);
  if (Math.abs(cx) > 1e-6 || Math.abs(cy) > 1e-6) {
    throw new Error(`projection selfCheck failed: center lands at [${cx}, ${cy}], expected [0, 0]`);
  }

  // Velachery hub (12.97726, 80.22092)
  const [vx, vy] = place(12.97726, 80.22092);
  const expectedVx = 428.94693;
  const expectedVy = -81.73000;
  if (Math.abs(vx - expectedVx) > 0.01 || Math.abs(vy - expectedVy) > 0.01) {
    throw new Error(`projection selfCheck failed: Velachery hub lands at [${vx}, ${vy}], expected [${expectedVx}, ${expectedVy}]`);
  }

  // Sholinganallur hub (12.89354, 80.23206)
  const [sx, sy] = place(12.89354, 80.23206);
  const expectedSx = 450.65590;
  const expectedSy = 85.71000;
  if (Math.abs(sx - expectedSx) > 0.01 || Math.abs(sy - expectedSy) > 0.01) {
    throw new Error(`projection selfCheck failed: Sholinganallur hub lands at [${sx}, ${sy}], expected [${expectedSx}, ${expectedSy}]`);
  }

  return true;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  selfCheck();
  console.log('projection: self-check passed');
}
