# AGY hand-off — build the Corridor Bench

You are taking over the implementation of the dossier's map figure in this
repository. Work in the repository at `C:\Users\aswat\Downloads\Projects\mobile-vet-report`.

## Read these first, in this order

1. **`research/MAP-FIGURE-BRIEF.md` — the contract.** It specifies the object,
   the parts list, the data binding, the camera, the interactions, the palette,
   the build order, the verification and the risks. Follow it. It is written to
   be executable without further questions. Where it is explicit, it wins.
2. **`C:\Users\aswat\.agents\skills\anatomy\SKILL.md` and its `references/`** —
   the drawing method, the kit API, the craft rules, motion, verification and
   the print sheets. The kit is at `C:\Users\aswat\.agents\skills\anatomy\kit\`.
   Open the closest example before you start (`examples/test-rig` for the craft
   bar, `examples/dial-indicator` for the smallest build, `examples/raptor-engine`
   for a dense assembly).
3. **`DESIGN.md` and `PRODUCT.md`** — the site's design record and product
   truth. The world is "The Sign Band". Read `src/styles/tokens.css` for the
   real token names.
4. **`docs/08-design-history.md`** — why the site looks the way it does, and the
   rules the previous builds were held to.
5. **`src/pages/zones.astro`, `src/components/RouteMap.astro`,
   `src/components/FlowDiagram.astro`, `src/components/DossierRail.astro`** —
   the surface you are adding to, and the conventions it follows.
6. **`scripts/build-zones.mjs` and `scripts/dossier-blocks.mjs`** — how the
   dossier's blocks are generated. Your figure follows the same pattern: a
   build script writes into `src/content/zones/`, and the page imports the
   output. Nothing in `src/content/` is hand-edited.

## What to build

The **Corridor Bench**: a milled plate on a dispatch bench showing the two
corridors, all hundred localities as machined stop pins at their true
coordinates, the fifteen routes as brass link bars in travel order, and a
movable price token that re-reads every route's margin. Clicking a stop raises
a readout with that locality's numbers. The decision board filters the plate.
A stop can be linked to and highlighted.

Merge it into the existing dossier route. **Do not build a separate page.**
The figure goes under the zone buttons in `src/pages/zones.astro` and a still
version goes into `src/pages/zones-print.astro`.

## Hard constraints

- **The data is the truth.** Every physical property comes from
  `research/zone-a/localities.json` and `research/zone-b/localities.json`
  through the pure projection module. Never hard-code a number, a coordinate
  or a locality name in the drawing code.
- **Do not change the corpus.** Do not edit anything under `research/zone-a/`,
  `research/zone-b/` or `research/merged/`, and do not run `npm run harmonise` —
  it rewrites the research pass's output in place and is not idempotent.
- **Do not break the checks.** These must still pass when you finish:
  `node scripts/check-prose.mjs`, `node scripts/audit-dataset.mjs`,
  `node scripts/verify-interactions.mjs`. Extend `verify-interactions.mjs`
  to cover the figure: select a stop, move the token, filter from the board,
  reach a stop by keyboard, follow a deep link.
- **No new npm dependencies.** The kit is vendored into `src/iso/`; it is
  plain ESM and needs nothing installed. Puppeteer is already a dev
  dependency for the screenshots and the PDFs.
- **One accent.** The site's yellow (`--signal`) marks the token and the
  current selection. Nothing else in the figure is yellow. A verdict is a
  head shape, never a colour. A corridor is a milled channel. A price is a
  number on an engraved plate.
- **Four tones, no gradients, no shadows, no radius above 2px.** The tones
  are the site's inks at four opacities on the paper ground.
- **The print twin** must carry the figure with every animation disabled and
  the readout platen drawn open on one locality.
- **Work on `master` in this repository and commit each phase** with a
  message that says what the phase did. Do not create a branch, do not amend
  or rebase, do not force-push.
- **Do not deploy.** Do not push to GitHub, do not touch GitHub settings. The
  owner handles publishing.

## How to work

Follow the brief's phase order. After each phase, build and look at what you
built — `npm run build`, then serve it on a port of your own (the owner's
preview is already running on 127.0.0.1:4321, so use 4322) and read the
screenshots rather than assuming they are right.

Run the anatomy audits until they pass:

```
node scripts/build-map-figure.mjs --audit      # must end: audit passed
node scripts/lines.mjs <built figure>.html --out shots/lines.png   # must print: line ends: 0
```

Capture desktop (1440) and phone (390), plus hover, selected and platen-open
states, and read every PNG. Use the anatomy skill's own `scripts/capture.mjs`
and `scripts/drive.mjs` for this.

Iterate until the audits are clean, the screenshots are right and the site's
checks still pass. Do not stop at "it renders".

## Report back

When you finish, say plainly:

1. What you built and where — every file you added or changed.
2. The audit results: `audit passed`, `line ends: 0`, and the capture set.
3. The check results: `check-prose.mjs`, `audit-dataset.mjs`,
   `verify-interactions.mjs`, each with its actual output.
4. What you did **not** do, what you cut for time, and anything in the brief
   you could not satisfy.
5. The commits you made, by hash and message.

If you run out of time, stop at a working phase and say which one, rather than
leaving a half-built figure in the tree.
