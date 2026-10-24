# Status of the locality dossier

The dossier lives at `/zones/`, with its own PDF at
`pdf/mobile-vet-locality-dossier.pdf`.

**It is researched, not modelled.** Two research passes collected the corpus:
one over the south-east cluster, one over the OMR and ECR corridor. Their raw
evidence, their model notes and their source lists are in `research/zone-a` and
`research/zone-b`. Every figure in the dossier carries a provenance tier, and
the tiers are printed with the numbers.

**It is internal.** The route is marked `noindex`, the slate on its masthead
says so, and it is not the document to hand to an investor. The market report
at `/` is that document. The dossier is the working document behind it, and it
is published here so the team can read the evidence rather than take the
verdict on trust.

**Half its household base is modelled.** Zone A's fifty localities carry tier C
quantities because their household base comes from a modelled built-footprint
density. Zone B's carry tier B because theirs comes from the Census and the
Corporation's property-tax ledger. The report says so where it matters.

**Its map is a placement, not a survey.** The locality map puts all hundred
places at their true coordinates and draws the fifteen routes in travel order.
Colour is the dossier's own verdict rule and shape repeats it, so the sheet
reads in black and white. The positions are placed from coordinates with a
cos(lat) correction at 13°N and are not a survey, the coastline and road
spines come from OpenStreetMap at the corpus's own resolution, and the scale
bar is measured against that placement. Where the figure and a survey would
disagree, the dossier's prose and tables are the authority.

The map is interactive: hovering lifts a place and reads its numbers, clicking
keeps it and puts it in the link, four sliders filter the sheet, and zooming
separates the places that overlap at the opening frame. The frame opens on the
coastal corridor, where ninety-eight of the hundred places sit; two lie far to
the west and are reached with the `all` control. The printed dossier carries
the same sheet with its names and its scale bar laid out at the printed size.

This file replaces a note left by a review agent in the first hours of the
project, which neutralised the dossier route on the grounds that the corpus
was modelled. At that moment the corpus really was modelled: the site had
been built against a fixture so the pipeline could be developed while the
research ran. The research has since been done, the route was restored, and
the note was wrong about the work and right about the data. See
`attempts/002-dossier-scaffolding.md` for the whole episode.
