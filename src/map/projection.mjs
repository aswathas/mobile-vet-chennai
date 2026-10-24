// Plan projection for the locality map.
//
// The map is drawn straight down onto the paper: no tilt, no perspective, no
// camera. Coordinates go in, millimetres of map go out.
//
// Equirectangular with a cos(lat) correction at the corpus's own latitude,
// measured in metres from the corpus centre, so a distance on the map is a
// distance on the ground. Not a survey; a placement.
//
// +x points East, towards the coastal corridor and the right of the map.
// -y points North, towards Thiruvanmiyur and the top of the map.

export const LAT_REF = 13.0; // 13°N
export const RADIANS = Math.PI / 180;
export const COS_LAT = Math.cos(LAT_REF * RADIANS);

// Metres per degree: 110 574 m of latitude, and the same number of metres of
// longitude before the cos(lat) correction shortens it.
export const M_PER_DEG_LAT = 110574;
export const M_PER_DEG_LON = 111320;

// The corpus centre. Longitude runs 79.737 to 80.264, latitude 12.838 to 13.035.
export const LON_0 = 80.000805;
export const LAT_0 = 12.936395;

/**
 * Maps geographic coordinates (lat, lon) to map millimetres [x, y].
 */
export function place(lat, lon) {
  const x = (lon - LON_0) * COS_LAT * M_PER_DEG_LON;
  const y = -(lat - LAT_0) * M_PER_DEG_LAT;
  return [x, y];
}

/**
 * The distance between two places on the ground, in metres, by the same
 * projection the map draws with. The corpus's own travel notes quote road
 * distances; this is the straight line between the same two coordinates.
 */
export function distanceMeters(lat1, lon1, lat2, lon2) {
  const [x1, y1] = place(lat1, lon1);
  const [x2, y2] = place(lat2, lon2);
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Verification self-check: a known pair of places lands at a known distance,
 * and the centre lands at the origin.
 */
export function selfCheck() {
  const [cx, cy] = place(LAT_0, LON_0);
  if (Math.abs(cx) > 1e-6 || Math.abs(cy) > 1e-6) {
    throw new Error(`projection selfCheck failed: centre lands at [${cx}, ${cy}], expected [0, 0]`);
  }

  // Tambaram West (12.92579, 80.11792) to Velachery main (12.97726, 80.22092):
  // 11.17 km east and 5.69 km north, so 12.54 km on the ground.
  const km = distanceMeters(12.92579, 80.11792, 12.97726, 80.22092) / 1000;
  if (Math.abs(km - 12.54) > 0.05) {
    throw new Error(`projection selfCheck failed: Tambaram to Velachery reads ${km.toFixed(2)} km, expected 12.54 km`);
  }

  // The coastal band is 15.9 km wide at the latitudes it runs through.
  const band = distanceMeters(12.9, 80.1182, 12.9, 80.26442) / 1000;
  if (Math.abs(band - 15.86) > 0.05) {
    throw new Error(`projection selfCheck failed: the band reads ${band.toFixed(2)} km wide, expected 15.86 km`);
  }

  return true;
}
