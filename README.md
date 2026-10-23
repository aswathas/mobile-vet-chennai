# Mobile Veterinary Practice, Chennai

A market assessment and launch plan for a house-call veterinary practice in
south Chennai, and the locality dossier that sits behind it.

## The two documents

| Route | What it is | For |
|---|---|---|
| `/` | The market assessment: 7,120 words, 83 cited sources, ten tables, a go or no-go verdict and a ninety-day launch plan | The founding team, and investors and partners |
| `/zones/` | The locality dossier: 100 scored localities across two corridors, hour and weekday and seasonal demand, price bands, route economics, a decision board and a full appendix | The internal R&D team |

Both are static Astro, and each has a PDF twin printed through headless Chrome
from the same source, so a document cannot drift between its screen and its
page.

## Running it

```
npm install
npm run content        # build the market report from content/final_turn_001.md
npm run zones          # build the locality dossier from the merged corpus
npm run build          # build the site into dist/
npm run preview        # serve it on http://127.0.0.1:4321
npm run pdf            # print the market report to a PDF
npm run pdf:zones      # print the locality dossier to a PDF
```

The fonts are fetched locally, so the site has no runtime dependency on a font
CDN and the PDFs render identically offline:

```
node scripts/fetch-fonts.mjs
```

## The corpus

`research/zone-a` and `research/zone-b` hold the two research passes: the
dataset, the source list, the model note and the narrative analysis for each
corridor, plus the scripts that collected the evidence.

Every locality-level figure carries a provenance tier, and the tier travels with
the number it qualifies. No figure in the corpus is tier A. Zone A's household
base is modelled, so its quantities are tier C; Zone B's comes from the Census
and the Corporation's property-tax ledger, so its quantities are tier B.

## Checks that run

```
node scripts/audit-dataset.mjs    # the corpus closes its own arithmetic
node scripts/check-prose.mjs       # 47 claims the dossier makes, checked against the data
```

`check-prose.mjs` is the important one. The dossier's prose is written by hand
and its tables are generated, and this script is what stops the two from
drifting apart. It fails when a number in a sentence stops matching the number
in the dataset.

## The documentation

`docs/` holds the project's chronicle: the problem as it was stated, the
options, the decisions and what would reopen them, the plan, the scope, what was
verified, and the retrospective. `docs/attempts/` holds the paths that did not
work, which is the part worth reading before changing anything. `docs/decisions/`
holds the changes made to locked beats.

```
docs/01-problem.md            the problem, in the founder's words
docs/02-options.md            what else was possible, and why not
docs/03-decision.md           what was chosen, and what would reopen it
docs/04-plan.md               what was done, in order
docs/05-mvp.md                what it does, and what it deliberately does not
docs/06-verification.md       what was measured, and what is still untested
docs/07-retro.md               what we would do differently
docs/DOSSIER-STATUS.md        what the dossier is and is not
docs/attempts/                the failed paths
docs/decisions/               the changes to locked beats
```

`DESIGN.md` is the design record: the tokens, the components, the state
vocabulary and the rules the build was made against.

## The reading

The dossier's answer, in one paragraph: open the first route in Zone A, on the
Velachery cluster, and do not open the OMR corridor until that route is
carrying six visits a day. Zone A holds 11,576 of the 16,583 cases a month the
two corridors hold, and Rs 1.51 crore of the Rs 2.24 crore the practice mix
could reach, against a mean competition saturation of 31.8 against Zone B's
59.6. Hold the Thiruvanmiyur cluster for the third route: it earns Rs 91,728
of contribution per route against the Velachery route's Rs 70,668, but it is
also the most contested ground in the corpus.
