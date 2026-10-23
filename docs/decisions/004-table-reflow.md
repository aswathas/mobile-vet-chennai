# 004 — Wide tables scroll as one region instead of reflowing

**Date.** 2026-10-24
**Supersedes.** The accessibility commitment in `PRODUCT.md`: "the tables
reflow rather than requiring horizontal scroll".
**Change.** Tables now wrap their cells and scroll horizontally as a single
region on a narrow screen, and the product's commitment was rewritten to say
so. No word is ever clipped mid-word, and the horizontal scroll is visible and
themed from the palette rather than the browser's default chrome.
**Why.** The market report's tables are written in Markdown and carry no
per-cell labels, so a stacked reflow would print a column of values with no
indication of what each one is. The dossier's hundred-row appendix has nine
columns whose whole meaning is that they are read across, not down. A scroll
region keeps the reading act intact; a naive reflow destroys it.

This was found by the design documenter, reading the built code against the
product's own promise, and it is a real deviation rather than a
discoverable state. The commitment was written before a hundred-row table was
in scope.
