// The Locality Map — label layout.
//
// A place's name is engraved beside its mark, but only where the name has
// room: a label that lies across another mark reads as a smudge and hides the
// very thing it names. So every name is offered four places to sit — right of
// the mark, left of it, above it, below it — and takes the first that is clear
// of every other mark, every other name, and the edge of the sheet.
//
// The names are laid out in order of the revenue they stand for, so when two
// of them want the same ground the bigger one keeps it.
//
// This is one implementation, used by the client layer, which re-lays the
// names out whenever the reader zooms, and by the print twin, which has no
// reader but is laid out by the same code in the browser that prints it.

// The places a name can sit, in the order they are tried. Right of the mark
// first, because that is where the eye looks.
const SPOTS = [
  { dx: 9, dy: 0, anchor: 'start' },
  { dx: -9, dy: 0, anchor: 'end' },
  { dx: 0, dy: -12, anchor: 'middle' },
  { dx: 0, dy: 17, anchor: 'middle' },
];

const hits = (box, other) =>
  box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top;

/**
 * Lays the names out.
 *
 * candidates: [{ id, x, y, text, revenue }] — where each mark is, in the same
 *   units as the obstacles and the sheet.
 * obstacles: [{ id, left, right, top, bottom }] — the things a name must not cross.
 * measure: (text) => width — how wide a name will be drawn.
 * sheet: { width, height } — the frame the names must stay inside.
 *
 * Returns a Map of id -> { dx, dy, anchor } for the names that were placed.
 */
function layoutLabels({ candidates, obstacles, measure, sheet }) {
  const placed = new Map();
  const taken = [];

  const ordered = [...candidates].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

  for (const candidate of ordered) {
    const width = measure(candidate.text);
    const sx = candidate.x;
    const sy = candidate.y;
    let chosen = null;

    for (const spot of SPOTS) {
      const left =
        spot.anchor === 'start'
          ? sx + spot.dx
          : spot.anchor === 'end'
            ? sx + spot.dx - width
              : sx + spot.dx - width / 2;
      // The baseline sits 4px below the spot; the name stands about 9px
      // above its baseline and hangs 3px below it.
      const baseline = sy + spot.dy + 4;
      const box = { left, right: left + width, top: baseline - 9, bottom: baseline + 3 };

      // A name that runs off the edge of the sheet is a broken word.
      if (box.left < 4 || box.right > sheet.width - 6) continue;
      // The name must not cross another mark, and must not lie over a name.
      if (obstacles.some((o) => o.id !== candidate.id && hits(box, o))) continue;
      if (taken.some((p) => hits(box, p))) continue;

      chosen = { spot, box };
      break;
    }

    if (!chosen) continue;
    placed.set(candidate.id, chosen.spot);
    taken.push(chosen.box);
  }

  return placed;
}

/**
 * The marks of a map, as obstacles for the names: every mark that stands on
 * its own is a thing a name must not cross.
 */
function markObstacles(marks) {
  return marks
    .filter((m) => !m.clustered)
    .map((m) => ({
      left: m.x - 11,
      right: m.x + 11,
      top: m.y - 11,
      bottom: m.y + 11,
      id: m.id,
    }));
}

/**
 * A cluster disc, as an obstacle: a name over a count hides the count.
 */
function clusterObstacle(disc) {
  return {
    left: disc.x - disc.radius - 2,
    right: disc.x + disc.radius + 2,
    top: disc.y - disc.radius - 2,
    bottom: disc.y + disc.radius + 2,
    id: `cluster:${disc.id}`,
  };
}
