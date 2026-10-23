---
name: The Sign Band
description: An international airport sign system applied to two decision documents — one yellow reserved for wayfinding, black type on white over a warm paper ground, every edge a drawn rule.
colors:
  signal: "#f2c200"
  signal-deep: "#c19c00"
  signal-ink: "#111111"
  paper: "#ffffff"
  ground: "#e8e6e0"
  panel: "#f6f5f1"
  ink: "#111111"
  ink-2: "#3a3a36"
  ink-3: "#6e6a62"
  ink-4: "#8b867d"
  rule: "#111111"
  rule-soft: "#cbc7be"
  rule-hair: "#dedbd4"
  closed: "#6e6a62"
typography:
  display:
    fontFamily: "'Public Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(34px, 6.2vw, 64px)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Public Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(22px, 3.1vw, 32px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  section:
    fontFamily: "'Public Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "27px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Public Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.24
    letterSpacing: "-0.01em"
  stage:
    fontFamily: "'Public Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "27px"
    fontWeight: 600
    lineHeight: 1.1
  body:
    fontFamily: "'Public Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  base:
    fontFamily: "'Public Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  lead:
    fontFamily: "'Public Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  table:
    fontFamily: "'Public Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "'Roboto Mono', ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.14em"
  caption:
    fontFamily: "'Roboto Mono', ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.04em"
  data:
    fontFamily: "'Roboto Mono', ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 500
    letterSpacing: "0.04em"
  micro:
    fontFamily: "'Roboto Mono', ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "9.5px"
    fontWeight: 500
    letterSpacing: "0.08em"
  figure:
    fontFamily: "'Public Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.03em"
rounded:
  none: "0px"
spacing:
  hair: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "30px"
  2xl: "44px"
  3xl: "60px"
  gutter: "clamp(14px, 4vw, 52px)"
components:
  band:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    padding: "34px clamp(14px, 4vw, 52px) 0"
  band-sub2:
    typography: "{typography.display}"
    fontSize: "0.46em"
  slate:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "12px clamp(14px, 4vw, 52px) 14px 0"
  frame:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    height: "34px"
    padding: "0 14px"
  frame-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.signal}"
    height: "34px"
    padding: "0 14px"
  frame-hover:
    backgroundColor: "{colors.signal-deep}"
  verdict:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    padding: "30px clamp(18px, 4vw, 46px) 28px"
  section-band:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    padding: "14px clamp(18px, 4vw, 46px) 15px"
  result:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "22px 24px 20px"
  trim:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    padding: "9px 0"
  gate:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: "46px"
    padding: "0 18px"
  gate-target:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    height: "46px"
    padding: "0 18px"
  gate-closed:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.closed}"
    height: "46px"
    padding: "0 18px"
  zonebtn:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "18px 20px 20px"
  zonebtn-hover:
    backgroundColor: "{colors.signal}"
  gobtn:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    padding: "16px clamp(14px, 4vw, 52px) 18px"
  foot:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "14px clamp(14px, 4vw, 52px)"
---

# Design System: The Sign Band

This document records the system as it is **built**, not as it was planned. Every colour, size,
class name and behaviour below was read out of `src/styles/tokens.css`, `frame.css`, `document.css`,
`zones.css`, `print.css`, `src/components/*.astro` and `src/pages/*.astro` in this repository.
Where the build and the direction contract disagree, the build is recorded and the divergence is
named. Where a rule was deliberately refused, the refusal and its reason are recorded too.

## Overview

**Creative North Star: "The Sign Band."**

The world is an international airport sign system: an overhead band you read at a distance, a gantry
of section signs, a white sheet of rules, and an arrow that tells you where to go next. Nothing in
this system is a card, a panel with a soft edge, or a floating object. Every edge is a drawn rule —
3px black where a band begins or ends, 1px hairlines inside a table, 2px where a figure's axis is.
The system is flat, high-contrast and fast to scan, because it is a wayfinding instrument pointed at
people who have to make one expensive decision.

The personality is **blunt, engineered, unhurried**: airport signage is confident enough to be loud
in exactly one place and disciplined everywhere else. The whole visual argument rests on a single
saturated yellow that is spent only on things that *point* — the masthead band, the section gantry
and its current-section inversion, the section opener bands, the destination gate on the decision
board, the peak hour in the demand curve, the peak day, the peak month, the top-ranked locality, and
the break-even flag on the price scale. Everything else is black type on white over a warm paper
ground (`--ground`), and the eye is left to do the reading.

Two voices do all the work. **Public Sans**, a humanist sans, carries prose, band messages and the
monumental numbers. **Roboto Mono** carries everything that is a *fact*: parameters, numerals in
tables, unit conventions, ward and cluster codes, source ids, axis labels, ticks and captions. The
split is not stylistic: it is the difference between prose and evidence, and it holds everywhere in
the build, including inside SVG figures, where `.ch-axis`, `.rm-gate__id`, `.fl-k` and `.fl-n` are
all monospaced.

The system refuses, deliberately and consistently: grain, perforation, film, drop shadows, rounded
corners, gradient text, glass, glyph icons and emoji, and kickers or eyebrows above headings. The
pictogram is a black square (`.trim__pin`, 14×14px) and it is never decorative. The arrow is CSS
triangles, not an icon font.

**Key Characteristics:**

- One yellow, one meaning: wayfinding. It never sits behind body text and never fills a page.
- Flat by construction. `box-shadow` appears once in the whole codebase, as `none`.
- Depth is drawn, not cast: borders, rules, inverted bands, tonal grounds (`--paper`, `--panel`,
  `--ground`).
- Two type voices with a hard job split: Public Sans for words, Roboto Mono for facts.
- A 68-character reading measure (`--measure: 68ch`) that never yields to a figure or a table.
- The arrow is the memorable moment: one black triangle, re-pointed by script whenever a filter changes.

## Colors

The palette is one accent over three grounds and four inks. There is no secondary and no tertiary
hue — a second colour would compete with the yellow for the job the yellow is doing.

### Primary

- **Signal Yellow** (`--signal: #f2c200`): the one colour that means *go here*. It is the masthead
  band (`.band`), the section gantry cells (`.frame`), the section opener bands (`.doc h2`), the
  verdict band (`.verdict`), the destination gate (`.gate--target`), the peak bar/day/month/top row
  in every dossier figure, the break-even flag (`.scale__tick[data-tone='flag']`, `.result__flag`),
  the selection highlight (`::selection`), and the target gate on the route map
  (`.rm-gate--target`). Yellow is never a page background and never a background behind running
  prose.
- **Signal Deep** (`--signal-deep: #c19c00`): the hover and pressed state of a yellow band, and
  nothing else. Used by `.frame:hover` and `.gobtn:hover` only.
- **Signal Ink** (`--signal-ink: #111111`): the ink that sits *on* yellow. Black on `--signal`
  measures 11.3:1, which is why the band messages and the gate bands can carry weight without
  tinting.

### Neutral

- **Paper** (`--paper: #ffffff`): the reading sheet (`.window`), the key result panel (`.result`),
  the table and figure interiors, the citation hover ground.
- **Ground** (`--ground: #e8e6e0`): the warm page behind everything — `body`, the sticky gantry
  (`.rail`), the source stack (`.bin`). It is the only warm colour in the system.
- **Panel** (`--panel: #f6f5f1`): the quiet fill for inert surfaces — inline `code`, empty tracks
  (`.wk__fill`, `.rb__track`, `.ladder__cell`), the board's empty state, and the themed scrollbar
  track.
- **Ink** (`--ink: #111111`): body headings, table headers, the black rule, the footer ground, and
  the inverted current section.
- **Ink 2** (`--ink-2: #3a3a36`): running prose (`.doc p`, `.doc li`, table cells). 11.4:1 on paper.
- **Ink 3** (`--ink-3: #6e6a62`): labels, captions, axis text, source ids, the rail's secondary
  text. 5.4:1 on paper — the floor for small text.
- **Ink 4** (`--ink-4: #8b867d`): used in exactly one place, the 10px source-id suffix inside
  `.scale__pub i`. At 3.6:1 on paper it does not meet AA for small text; treat it as a known limit,
  not as an approved token for anything else.
- **Closed** (`--closed: #6e6a62`): a closed gate (`.gate--closed`) — the same grey as Ink 3, so a
  shut door reads as *shut*, not as *highlighted*.
- **Rules** (`--rule: #111111`, `--rule-soft: #cbc7be`, `--rule-hair: #dedbd4`): three weights of
  drawn line — structural (1–3px black), table cell separation (1px `--rule-hair`), and internal
  separators (1px `--rule-soft`).

### The Ladder

The ramp above is a hierarchy; this is every step it lands on, so nothing in the
build sits off the scale.

- **9px, 9.5px** — micro data. Axis tick labels, source-id suffixes, scale
  micro-notes.
- **10px** — table heads, the smallest uppercase labels.
- **11px** — the label size. Uppercase, tracked, never running text.
- **12px, 12.5px, 13px** — data. Captions, table numerals, mono parameters,
  the remarks column, rail labels.
- **13.5px, 14px, 14.5px, 15px** — table bodies and lead-in text.
- **16px, 16.5px, 17px** — body. Prose at 17px, 16.5px on a phone, 16px for
  the base.
- **19px, 20px, 21px, 22px** — titles. The verdict message, section titles,
  corridor button names, panel values.
- **26px, 27px, 32px, 34px** — section bands and stage values.
- **40px, 64px, 68px** — display. The key figure, the masthead title.

### Named Rules

**The One Signal Rule.** `--signal` is reserved for wayfinding and for nothing else: the masthead
band, the section openers, the gantry's current section, the gate the arrow points at, the one hour,
day, month or locality the demand data says to go to, and the break-even flag. If a new surface
wants yellow for emphasis on something that is not a destination, it does not get yellow.

**The Ink Stays Ink Rule.** On a yellow ground the text is `--signal-ink` (black), never a tint of
the yellow and never a grey. The one exception is deliberate and local: `.gate--target .gate__v` and
`.gate__v i` drop to `rgba(17,17,17,0.72)` because those are secondary labels inside a yellow row.

**The Paper Rule.** The reading surface is `--paper`. `--ground` is the world outside the sheet and
`--panel` is the world inside a component that is inert. Nothing else is a background.

## Typography

**Display Font:** Public Sans (self-hosted variable, weights 200–900, `public/fonts/fonts.css`),
fallback `'Helvetica Neue', Arial, sans-serif`
**Body Font:** Public Sans, same stack
**Label/Mono Font:** Roboto Mono (self-hosted 400 and 500, `public/fonts/fonts.css`), fallback
`ui-monospace, SFMono-Regular, Consolas, monospace`

**Character:** A plain, slightly condensed humanist sans for words, and a true monospace for facts.
The pairing says "this is prose" and "this is measured" without ever using colour or weight tricks
to make the distinction: it is the letterform itself.

### Hierarchy

- **Display** (600, `clamp(34px, 6.2vw, 64px)`, line-height 0.98, tracking -0.025em): the masthead
  title only (`.band h1`), capped at `max-width: 22ch`.
- **Display Sub** (400, `0.46em` of the display, line-height 1.12): the subtitle line inside the
  h1 (`.band__sub2`) — the same type, quieter, so it reads as part of the sign.
- **Headline** (600, `clamp(22px, 3.1vw, 32px)`, line-height 1.1, tracking -0.02em): the verdict
  message (`.verdict p`, `clamp(19px, 2.3vw, 25px)`) and the section opener band (`.doc h2`).
- **Title** (600, 20px, line-height 1.24): `h3` inside the sheet, `.zonebtn__name` (22px), and the
  flow diagram's stage values (`.fl-v`, 27px; `.fl-v--long` drops to 19px so a long money figure
  stays inside its box).
- **Body** (400, 17px, line-height 1.62, colour `--ink-2`): `.doc p` and `.doc li`, inside a
  **68-character measure** (`--measure: 68ch`). 16.5px at ≤720px. The base `body` is 16px.
- **Label** (500, 11px, tracking 0.14em, uppercase, `--ink-3`): `.slate__k`, `.result__k`,
  `.board__k`, `.doc h4`, `.railbox__k`. Never placed above a heading as an eyebrow.
- **Data** (Roboto Mono, 11–13px, tracking 0.04–0.12em): every parameter, table numeral, unit
  convention, ward or cluster code, source id, axis label, scale tick and caption. Within it:
  `.trim__n` 11px, `.gate__v` 12px, `.slate__v` 13px, `.chart__cap`/`.rm-cap`/`.flow__cap` 12px.

### Named Rules

**The Fact Is Monospaced Rule.** If a string is a number, a code, a unit, an id or a parameter, it is
set in Roboto Mono and given `font-variant-numeric: tabular-nums` (on `body` and on table cells).
Prose is Public Sans. The exception is the monumental figure in the key result panel
(`.result__num`, `clamp(40px, 6.4vw, 68px)`, weight 600) — it is a headline, so it speaks in the
display voice, and it carries `.result__flag`, a 14×14px yellow square with a black border, as its
only ornament.

**The Monospace Is Not Costume Rule.** Mono is used for measurement and data, never as a "technical"
texture. There is no monospaced label where a word would do better.

## Layout

**The window.** The report sheet is `--window-w: 1020px` (`.window`); the dossier sheet is wider —
`.window--wide` is `1240px` — because it carries the margin column and full-width figures. Both sit
centred on `--ground` with `--gutter: clamp(14px, 4vw, 52px)` of page margin.

**The reading column.** `.doc > *` is capped at `--measure: 68ch`. Nine classes are explicitly
allowed to break out of the measure and span the sheet: `.result`, `.chart`, `.tbl-scroll`,
`figure`, `.board`, `.flow`, `.routemap`, `.zonebtn`, `.doc__grid`, `.verdict`.

**The margin column (dossier only).** At `min-width: 1180px`, `.doc__grid` becomes
`minmax(0, 1fr) 13rem`: a sticky right-hand rail (`.doc__rail`, `top: calc(var(--band-h) + 18px)`,
`max-height: calc(100vh - var(--band-h) - 40px)`, `overflow-y: auto`) holding the unit conventions
(`.railbox__dl`), the provenance legend (`.tiers`) and how to read a gate. The rail's own headings
(`.railbox__k`) are labels in black on white with a 2px rule above them, **not** yellow bands —
yellow belongs to the signs. The market report carries no margin column: its caveats live inline in
the sentences that hold them.

**Breakpoints.**

- **≥1180px** — the dossier's 13rem margin column appears and sticks.
- **≤860px** — `.slate` becomes two columns (and stops pulling its first cell off the edge of the
  screen); `.trims` becomes one column; `.verdict__stamp` (defined but not currently rendered)
  would drop to a static inline row; `.gate` collapses to `52px 1fr 40px` and hides `.gate__v`.
- **≤720px** — `.doc` padding tightens to 18px and `h2` bands pull out to the sheet edge by -18px;
  `.doc p` drops to 16.5px; `.doc table` becomes `display: block; overflow-x: auto; min-width: 620px`
  so a wide table scrolls instead of being cut; `.zonebtn` becomes one column; `.gobtn__t` drops to
  21px; dossier figures tighten (`.rb__z` hidden, `.wk__fill` 22px, `.se` gap 3px, `.se__v` 9px).

**Print rules (`.impeccable` twin at `/print/` and `/zones-print/`).** `@page { size: A4; margin:
15mm 13mm 18mm }`. Body is 10.2pt / 1.5. The skip link and the gantry do not print
(`display: none !important`) — the document's own `h2` bands carry the wayfinding on paper. The
yellow bands print as yellow (`print-color-adjust: exact`), the window becomes the paper
(`border: 0`, no shadow), the verdict and the `h2` bands keep a 1.5pt black rule, `h3` and `h2`
carry `break-after: avoid`, paragraphs carry `orphans: 3; widows: 3`, the key result panel and the
figures carry `break-inside: avoid`, tables drop to 8.4pt with 7.4pt headers, chart SVGs are capped
at `88mm` tall, the citation chips become plain underlined numbers, and the footer stays a black
band with its 13mm bleed into the page margin.

**Accessibility, as implemented.** A `.skip` link ("Skip to the report" / "Skip to the dossier")
moves into view on focus; `:focus-visible` draws a 2px `--ink` outline with a 2px offset everywhere,
including inside the yellow band (`.band :focus-visible`), on the board's selects (1px offset) and
on the table scroll regions; `body` is 16px with a 68ch measure; `html` has
`scroll-padding-top: calc(var(--band-h) + 24px)` and headings carry the matching `scroll-margin-top`;
the gantry marks the current section with `aria-current="true"`; the price scale, the hour curve,
the flow diagram and the route map each carry `role="img"` with a written `aria-label`; the wide
tables are wrapped in `.tbl-scroll` with `tabindex="0" role="region"` and a label, so the scroll
region is keyboard reachable; the sources are a real `<ol>` with `id="ref-N"` anchors, and
`.trim:target` draws an outline so a deep link to a citation is visible; `header`, `nav`, `main`,
`article`, `aside` and `footer` are real landmarks with `aria-label`s; the dossier page carries
`<meta name="robots" content="noindex">` while it stays internal.

## Elevation & Depth

**This system has no shadows.** `box-shadow` is declared exactly once in the build, in
`frame.css` (`.window--sheet { box-shadow: none }`) and in `print.css`, and both are `none`. There
is no ambient shadow, no lift, no card. Depth is expressed the way a sign maker expresses it:
through the drawn rule, through the tonal step between `--ground`, `--paper` and `--panel`, through
the inversion of a band (black on yellow versus yellow on black), and through scale.

The one three-dimensional move in the entire system is the corridor buttons' **resting four-degree
tilt** (`.zonebtn__link { transform: perspective(900px) rotateX(4deg); transform-origin: bottom
center }`). On hover and focus the tilt flattens and the button lifts two pixels
(`perspective(900px) rotateX(0deg) translateY(-2px)`) and its ground turns yellow. It is the only
perspective transform in the build and it is reserved for the way in — the two corridors the reader
is about to choose between.

**Motion.** One easing and one duration for the whole system: `--ease: cubic-bezier(0.16, 0.84,
0.44, 1)` and `--dur: 220ms`. The transitions are state changes, not entrances: the gantry cell's
ground and ink on hover, the ruler flag's `left`, the arrow's `translateX(6px)` on the "next
document" band, the board's gate background and opacity. The one authored moment is the **route
map's draw-on**: `.rm-order` is a dashed polyline whose `stroke-dashoffset` animates from 1 to 0 over
1400ms when the figure enters the viewport (`IntersectionObserver`, threshold 0.35, once, with a
no-JS fallback that adds `is-drawn` immediately). Under `prefers-reduced-motion: reduce` the token
`--dur` becomes `0ms`, `scroll-behavior` becomes `auto`, the draw-on is switched off and the dashed
route is shown already drawn.

### Named Rules

**The Flat-By-Default Rule.** Nothing floats. If a surface needs to separate itself from another,
it is separated by a rule, a rule weight, or a tonal step — never by a shadow.

**The One Move Rule.** One three-dimensional gesture exists in this system (the corridor button's
tilt). Do not add a second. If a new surface wants depth, it gets a border.

## Shapes

**Square, always.** `border-radius: 0` is the system; the only `border-radius` declaration in the
build is a `border-radius: 0` on the board's select, written explicitly to cancel the OS styling.
Nothing is rounded, and nothing is pill-shaped.

**The drawn edge.** Structure is a 3px black rule (`--rule`): the masthead's bottom edge, the
section bander's top and bottom, the spec plate's top and bottom, the source stack's top edge, the
gantry's bottom edge, the board's head. Internally, 1px `--rule-soft` separates rows and 1px
`--rule-hair` separates table cells; the last row of a table ends on a 1px `--rule` line. A figure
opens with a 2px rule and closes with a 1px `--rule-soft` rule.

**The square pictogram.** `.trim__pin` is a 14×14px black square standing in for a pin. It is the
only pictogram in the system and it is never decorative: it marks a source. `.result__flag` is the
same idea at a smaller scale — a 14×14px yellow square with a 1px black border, marking the
break-even figure. `.gate__arrow`, `.gobtn__arrow` and the gantry's current-section flag are CSS
triangles (border tricks), not glyphs and not images.

## Components

### The masthead band (`.band`)

Full-bleed `--signal` with a 3px black bottom rule. `.band__inner` is capped at `--window-w` with
`padding: 34px var(--gutter) 0`. It carries the display `h1` (with `.band__sub2` as the subtitle at
0.46em), a `.band__deck` one-line deck at 17px / 56ch, and a `.band__note` in mono 12px carrying the
document's counts (words · sources · sections).

### The spec plate (`.slate`)

The four parameters of the document, in mono, on a white strip pinned to the band's lower edge:
`grid-template-columns: repeat(4, 1fr)`, `border-top: 3px solid var(--rule)` and
`border-bottom: 3px solid var(--rule)`, each cell separated by a 1px `--rule-soft` rule. The label
is `.slate__k` (mono 10px, 0.14em, uppercase, `--ink-3`); the value is `.slate__v` (mono 13px,
`--ink`). At ≤860px it becomes a 2×2 grid.

### The gantry (`.rail`, `.rail__strip`, `.frame`)

A sticky row (`position: sticky; top: 0; z-index: 50`) on `--ground` with a 3px black bottom rule.
Each section is a yellow sign: `.frame` is `--signal` on `--signal-ink`, 34px tall, 14px of side
padding, 13px / 600 type, with its ordinal in mono (`.frame__n`, 11px) and a 1px black border. The
strip scrolls horizontally on narrow screens with the scrollbar hidden (`scrollbar-width: none`).

Above the cells sits the **scrub ruler**: `.rail__ruler`, an 11px band ruled with a repeating
1px/14px tick gradient and a black triangular flag (`.rail__ruler-mark`) that slides to the centre
of the current section (`transition: left var(--dur) var(--ease)`).

**States.**

- *Current* — `aria-current="true"`: the band inverts to black ground with yellow ink, and a black
  flag appears beneath it (`.frame[aria-current='true']::after`).
- *Read* — `data-read="true"`: the section's ordinal is struck through
  (`text-decoration: line-through`), recorded in `localStorage` under `mvt-last-frame` /
  `mvt-dossier-last-frame` so the reader sees how far into the document they have been.
- *Hover* — `--signal-deep`.
- *Focus* — the global 2px `--ink` focus outline.

### The verdict band (`.verdict`)

Black on yellow, one message, full sheet width (it cancels the sheet's padding with negative
margins) with a 3px black bottom rule. The message is `.verdict p` at `clamp(19px, 2.3vw, 25px)`,
weight 600, `max-width: 60ch`. It is a band, not a stamp: nothing is rotated, nothing is outlined.
The class `.verdict__stamp` (a small black plate) is still defined in `frame.css` and `print.css`
but is **not rendered on any of the four routes** — it is a leftover, not a component.

### The key result panel (`.result`) and the price scale (`.scale`)

A white panel with a 1px black border (`padding: 22px 24px 20px`). `.result__head` puts the
label (`.result__k`, mono 11px uppercase) on the left and the monumental figure (`.result__num`,
`clamp(40px, 6.4vw, 68px)`, weight 600, tracking -0.03em) on the right, followed by `.result__sub`
(15px, `--ink-2`, 74ch).

The **price scale** is painted from the two marked values themselves — `--floor` and `--target` are
written as inline custom properties on `.scale__strip` and the gradient is
`linear-gradient(to right, var(--rule-soft) 0 var(--floor), var(--ink) var(--floor) var(--target),
var(--signal) var(--target) 100%)` — so the colour can never disagree with the ticks printed under
it. `.scale__minor` marks the eight prices Chennai operators actually publish (Rs 200, 299, 399,
599, 699, 999, 1,199, 1,699) as unlabelled 1px paper-coloured notches, because they crowd the left
of the scale. The labelled ticks (`.scale__tick`, with `i`/`b`/`u` for line, value and note) are
Rs 200 (observed floor), Rs 850 (cost per visit), Rs 1,100 (break-even floor, `data-tone="flag"`) and
Rs 1,499 (target). The flagged tick is taller (11px) and its value sits in a yellow plate with a
black border. Under the strip, `.scale__published` lists each published price with the service it
buys and the source id it came from, in mono, separated by a middot.

### The section band (`h2` inside `.doc`)

The opener for each of the nine (or ten) sections: `--signal` ground, `--signal-ink` text,
`clamp(22px, 3.1vw, 32px)`, weight 600, `text-wrap: balance`, with a 3px black rule above and
below and negative margins that run it to the sheet's edges.

### The source panels (`.bin`, `.trims`, `.trim`)

The source stack sits on `--ground` with a 3px black top rule and a 3px `.bin__lip` under it. The
sources are split into two columns (`.trims`, `1fr 1fr`, 26px gap), each a list of `.trim` rows on
a `16px 30px 1fr` grid: the black pictogram square `.trim__pin`, the mono source number `.trim__n`
(`01`, `02`, …), the publisher `.trim__label`, and the full URL `.trim__url` on its own row beneath,
in mono 11px with `word-break: break-all`. Each row is separated by a 1px `--rule-soft` rule and
carries `id="ref-N"`.

### The margin column (`.doc__rail`, `.railbox`, `.railbox__dl`, `.tiers`)

The dossier's 13rem sticky rail. Three boxes: **Units** (a `<dl>` where the term is mono and the
meaning is prose), **Provenance** (the A/B/C tier legend, `.tiers`, each tier with its definition and
its count in the corpus), and **Reading a gate** (prose). The rail's headings are black on white
with a 2px rule above; they are labels, not signs.

### The corridor buttons (`.zonebtn`, `.zonebtn__link`)

Two links in a 2-column grid (`1fr 1fr`, 18px gap), each a white panel with a 1px black border and
the resting four-degree perspective tilt described under Elevation. Inside: `.zonebtn__id` (a black
plate with yellow mono uppercase text), `.zonebtn__name` (22px, weight 600) and `.zonebtn__v`
(mono 12px). On hover or focus the panel turns yellow and flattens.

### The decision board (`.board`, `.gates`, `.gate`)

The board is a 1px black-bordered white panel with a head (`.board__k` label and `.board__note`),
a filter row (`.board__filters` — three `<select>`s for zone, verdict and tier, each with a drawn
chevron and `appearance: none`, so no OS chrome leaks in) and the list of fifteen gates.

A `.gate` is a row on a `56px minmax(0,1fr) 84px 104px 84px 36px` grid: the cluster id
(`.gate__id`, mono), the anchor name (`.gate__name`, 14.5px / 600), and three mono figures
(`.gate__v` — cases a month, blend, one route — each with a bold value over a small uppercase
label), then the arrow cell.

**States.**

- *Target* — `.gate--target`: the whole row goes `--signal`, its ink goes `--signal-ink`, and the
  arrow points at it. The arrow lives at the end of the row (`justify-self: end`) and is a black
  triangle 10px wide.
- *Closed* — `.gate--closed`: the name is struck through in `--closed` grey. A NO-GO cluster is a
  shut door, not a warning colour.
- *Filtered out* — `hidden` on the row.
- *Empty* — `.board__empty`: "No gate matches this filter. Widen it to see the rest." in mono on
  `--panel` with a 3px left rule. It appears only when a filter combination matches nothing.

The arrow is repainted by script on every filter change: the first gate that still stands is given
`.gate--target` and the arrow element, and the previous target loses both. The board's first gate
carries the arrow in the server-rendered HTML, so the board says where to go with JavaScript off.

### The three diagrams

**The hour curve** (`.chart` with inline SVG, `.ch-bar--a`, `.ch-bar--b`, `.ch-bar--peak`): 24
hours for both zones in one frame, Zone A left of the hour and Zone B right so neither hides the
other. The two series are told apart by **weight and hatch, never by hue** — the second series is
the `ch-hatch` 45° pattern — and the peak hour of each zone is the one bar in `--signal` with a
black stroke. Gridlines are `--rule-hair`, the axis line is `--rule`, and all axis text is mono
(`.ch-axis`). The legend (`.chart__keys`, `.ch-key__mark--a` / `--b`) repeats the solid-vs-hatched
distinction so the figure survives greyscale.

**The weekday strip and the seasonality strip** (`.wk`, `.se`): HTML cells rather than SVG. A day's
weight is a fill height derived from `--fill` (`calc(var(--fill) / 8 * 100%)`), the busiest day is
`.wk__cell--peak` and the best month is `.se__cell--peak` — both in `--signal` with a black rule.
The second zone's row drops to `--ink-3` so the two zones never read as two categories.

**The revenue ranking** (`.rb`): a name, a track (`.rb__track` on `--panel`) and a bar
(`.rb__bar` in `--ink`); the top row is `.rb__row--top` and its bar is `--signal` with an inset
black outline.

**The route map** (`.routemap`, inline SVG): two corridors as two lines of gates, each with a black
hub square at the left (`.rm-hub__box`), white gate squares with black strokes (`.rm-gate__box`),
the cluster id above and the cases a month below, all in mono. The gate to open first is
`.rm-gate--target` — yellow with a 2px black stroke. The dashed polyline that joins the gates
(`.rm-order`) draws itself on entry.

**The flow diagram** (`.flow`, inline SVG): five stages from households to the revenue the mix
could earn, each a white box with a 1.6px black stroke (`.fl-box`), joined by arrows (`.fl-arrow`),
with the conversion rate printed above each arrow (`.fl-rate`, mono, with a knocked-out paper
stroke so the label never cuts through the number). The last stage is `.fl-stage--last` and its box
is yellow. Below sits a dashed take-out box (`.fl-take__box`) stating what one route actually
takes, in Public Sans for the number and mono for the arithmetic.

### Tables (`.doc table`, `.tbl-scroll`)

Every table is ruled in black: 2px under the header row, 1px `--rule-hair` between rows, 1px
`--rule` under the last row. Header cells are mono 10px, uppercase, 0.12em. Body cells are 14.5px
`--ink-2` with `font-variant-numeric: tabular-nums`. A cell whose value is one of the decisive
figures is marked `data-flag="high"` (set by the Markdown plugin in `src/lib/remark-report.mjs`):
it switches to mono 13.5px weight 600 and carries a 9×9px yellow square with a black border after
the number — the one place yellow marks a value rather than a destination. Wide dossier tables are
wrapped in `.tbl-scroll` (`overflow-x: auto`, `min-width: 660px` on the table) with a themed
scrollbar (`scrollbar-width: thin`, `scrollbar-color: var(--ink-3) var(--panel)`, and an 8px
WebKit scrollbar in the same ink over `--panel`).

### Citations (`.cite`)

A bracketed marker such as `[47]` in the Markdown becomes a link to `#ref-47` with the class
`.cite`: Roboto Mono, 0.64em, weight 500, `vertical-align: super`, no background, no border, no
padding — a plain mono superscript, not a chip. On hover it inverts (black ground, paper ink).
This is the one place where the old "highlighted chip" would have been wrong: yellow behind every
source id would have made yellow the site's accent.

### The way to the other document (`.gobtn`, `.backlink`)

`.gobtn` is a yellow band under the masthead with a 1fr/auto grid: the mono label ("Next
document"), the 26px title, the mono count, and a black arrow (`.gobtn__arrow`, a 17px-wide CSS
triangle) that slides 6px right on hover while the band turns `--signal-deep`. The dossier's
return link is `.backlink`: mono 12px, uppercase, in `--signal-ink` on the yellow band with a 1px
underline in the current colour.

### The foot (`.foot`)

A black band with `--paper` text in mono 11px, holding the document code and its counts.

### Buttons, chips and inputs

There is no button component and no chip component in this system; the equivalent affordances are
the gantry cells, the corridor buttons and the "next document" band. The only form control is the
board's `<select>`, which is drawn: `appearance: none`, a 1px black border, `--paper` ground,
`--panel` on hover, a two-triangle chevron painted with a `linear-gradient` background image, and a
2px black focus outline.

## Do's and Don'ts

### Do:

- **Do** spend `--signal` only on something that points: a band, a gate, a peak, a flag, a target.
- **Do** set any number, code, unit, id or parameter in Roboto Mono, with `tabular-nums`.
- **Do** separate surfaces with a drawn rule — 3px `--rule` for structure, 1px `--rule-soft` inside,
  1px `--rule-hair` between table rows.
- **Do** keep prose inside `--measure: 68ch` and let `.result`, `.chart`, `.tbl-scroll`, `figure`,
  `.board`, `.flow`, `.routemap`, `.zonebtn`, `.doc__grid` and `.verdict` break out of it.
- **Do** paint a scale's colour from the same values that place its ticks, so the two can never
  disagree.
- **Do** give every figure a `role="img"` and a written label, and give every wide table a
  keyboard-reachable `role="region"` wrapper.
- **Do** give every interactive element a visible `:focus-visible` outline (2px `--ink`, 2px offset).
- **Do** use `--ink-3` (5.4:1) as the floor for small text and `--ink-2` (11.4:1) for running prose.
- **Do** keep the two zone series distinguishable by weight and hatch so every figure survives
  greyscale print.

### Don't:

- **Don't** put yellow behind running text, use it as a page background, or spend it on emphasis
  that is not wayfinding.
- **Don't** add a shadow. The system has none, and every separation is already a rule.
- **Don't** round a corner. The only radius in the system is `0`.
- **Don't** use a glyph, an emoji or an icon font for the arrow, the pictogram or the chevron. They
  are drawn: CSS triangles, black squares, gradient chevrons.
- **Don't** put a kicker or eyebrow above a heading. The heading carries its own weight; a label
  belongs to a figure (`result__k`), a parameter (`slate__k`) or a section band, not above a title.
- **Don't** turn a citation into a highlighted chip. `.cite` is a plain mono superscript.
- **Don't** colour two data series by hue. Use weight and hatch.
- **Don't** invent a second three-dimensional move. The corridor button's four-degree tilt is the
  only perspective transform in the system.
- **Don't** scroll a wide table off the edge of the sheet at desktop widths, or cut it off on a
  phone — wrap it in `.tbl-scroll` and let it scroll.
- **Don't** print the gantry, or let a yellow band lose its colour in print.
- **Don't** launder a caveat into a footnote. The market report keeps its qualifications inline in
  the sentences that hold them; the dossier keeps its conventions in the margin column beside the
  figure they qualify.

### Deliberate refusals, and why

- **No hero band over stacked cards on a grey page.** The masthead is a real sign band and the
  content is a ruled white sheet; a card grid would undo the world.
- **No clinical form with flagged result values.** Flagged cells (`data-flag="high"`) exist, but as
  a small yellow square beside a number in a table — never as a coloured form field.
- **No film, no perforation, no grain, no corner radius, no drop shadow.** Every edge is a drawn
  rule; the removed world is still visible in a few comments and in the unused `.verdict__stamp`
  rules, but not in the rendering.
- **No glyph icon system.** The pictogram is a black square, per the contract, and the arrows are
  CSS triangles.
- **No second accent colour.** A second hue would compete with the only colour that means
  "destination".
