# How this was made

The chronicle so far reads in order: a problem, some options, a decision, a
plan, a scope, a verification, a retro, and the paths that failed. This file is
the one that answers a different question. It is for the person who wants to
know **how the thinking actually ran** — where the ideas came from, what was
argued about before anything was built, and why the thing on screen looks the
way it does and not the way the first three proposals said it would.

It is written for someone who has never seen any of this before.

## The two questions, asked on the same day

The founder asked for two things that turned out to be separate problems.

The first was a business question: where in Chennai should a house-call
veterinary service sit, and can it be made to work? That question has an
answer, and the answer is on the market report.

The second was a document question: how should the answer be *shown*, so that a
veterinarian reads it and believes it? The instruction was blunt. "I want a
conclusive report because we are humans. People won't look at charts." And
then, later, when the corpus grew: "keep more visual stuff like a diagram more
way that you can convey information" and "the people who read this will be
veterinarians" — who, the founder was careful to add, can understand the
technical material without it being simplified for them.

Those two sentences set the whole design brief. The audience is a professional
reader who wants a conclusion they can defend in a room. That kills three
whole categories of design: the dashboard, the infographic wall, and the
consultancy deck. What it asks for instead is prose that carries the argument,
with the machinery underneath it — diagrams, tables and figures that a reader
can interrogate but does not have to.

## The research was the first design decision

The corpus did not come from a template. It came from two research passes run
as separate, isolated jobs — one for the south-east cluster (Chromepet, Tambaram,
Medavakkam, Pallikaranai), one for the OMR and ECR corridor (Navalur through
Sholinganallur to Thiruvanmiyur) — each producing fifty scored localities.

Each pass was given the same contract: a schema with a complete key set per
locality, two service mixes, an hour-of-day curve, a weekday split, a
twelve-month index, prices, economics, competition, travel, and a verdict. It
was given the same rule about evidence: every figure carries a provenance tier
and the tier travels with the number it qualifies. It was pointed at census
data, the Corporation's own property-tax ledger, an OpenStreetMap extract,
operator price pages and the Corporation's own street-level licence ledger.

The design consequence of running the passes separately is what matters. Two
independent passes do not agree about units, and when they were first merged the
OMR corridor looked six times larger than the south-east cluster — which would
have sent the founding team to the wrong place. The corpus was re-based onto a
single city-level calibration (households from Census 2011 grown by property-tax
growth, dogs and cats from the Corporation's August–October dog-registration
campaign against its own target, contacts per pet-owning household per year),
and the before-and-after is kept in `research/merged/calibration.json` so the
correction is auditable rather than hidden. The dossier says so in its own
text, in a section called "The corrections this dossier had to make to its own
research."

That section exists because a reader who finds one wrong number stops
believing all of them. Disclosing the repair is worth more than hiding it.

## The eleven worlds, and the two re-rolls

The visual direction was explored the same way the research was: as written
briefs to an external design agent, with the corpus quoted into the brief so
the direction had to hold a hundred localities and six hundred competitor rows
rather than a mood board.

Round one produced seven grounded candidates — the Greater Chennai Corporation
ward office and its property-tax ledger, the statistical handbook and census
atlas, Chennai's flood and cyclone ward atlas, the newsprint data desk, the
surveyor's field book and chain survey, the veterinary dispensary clinical
record, and the Tamil cinema hoarding — plus six catalog challengers fused with
the product and judged on two axes only: audience identification and product
clarity. The recommendation was the dispensary register, a bound clinical
record with a copper name plate, rubber-stamp verdicts and a day sheet for the
24-hour curve.

Then the founder rerolled. Every candidate from round one was burned, on the
grounds that it was out. A second round produced seven new grounded candidates
and six new challengers — the registered docket, the pairing card, the share
register, the signal cabin and the block register, the bill of quantities, the
cause list, the policy schedule — and recommended the signal cabin: an ivory
register ground, three signal inks for clear, caution and danger, a brass token
that hangs at the masthead and can be slid along the price ladder to re-read
every route's margin against it.

Then a third round, with the steer "bolder."

What survived from all of that was not a world but a **system**: one saturated
yellow reserved absolutely for wayfinding, black type on white over a warm
paper ground, hairline rules only, no shadows, no cards, no second accent,
Public Sans for prose and monumental figures, Roboto Mono for every parameter.
The masthead became an overhead band. The navigation became a gantry of
section bands with the current one inverted. The verdict became a band rather
than a stamp. The dossier's instruments became a chain diagram from households
to the revenue one route can reach, a diagram of the two corridors as lines of
gates, a decision board with live filters, two corridor buttons, and a margin
column carrying units, the provenance legend and how to read a gate.

The yellow is the whole argument of the design in one rule. A sign band that
loses its colour is not a sign band, so yellow is spent only on the things
that tell you where you are: the masthead band, the current section band, the
verdict band, the active filter, the corridor buttons, the selected source
mark. It is not spent on emphasis, on decoration, on a citation chip, or on a
number that merely wants to be noticed. Making that rule real cost nineteen
separate fixes in the review rounds, because a saturated yellow is so easy to
spread.

The things the discarded worlds contributed did not all die. Three were kept
explicitly and are named in the design record: the cloud edge's dispersion band
became the uncertainty geometry, the brick book's exploded build became the
route assembly order, and the incumbent's hanging trims became sources as
physical objects on the dossier's margin. The cutting bench itself was
retired, and `docs/attempts/003-cutting-bench-world.md` is the honest record of
why: it was the strongest thing in the roll and identified the reader better
than anything else, but a film strip that carried ten tables and eighty-three
sources could not carry a hundred localities and six hundred competitor rows.
Its frame did not scale, and keeping it would have meant a lateral move rather
than a replacement.

## The build rule: one source, two documents, four routes

Every number on screen comes from one place. Each document is one Markdown
file; a build script turns it into content blocks, tables, charts and the
prose; Astro renders it; a print stylesheet and headless Chrome produce the
PDF twin from the same route. A document cannot drift between its screen and
its page, because there is only one of it.

Two check scripts sit underneath. `audit-dataset.mjs` closes the corpus's own
arithmetic — the weekday split sums to one, the hour curve sums to one, the
weekly and monthly figures agree, the serviceable ceiling respects the
156-visit limit. `check-prose.mjs` holds forty-seven numbers that the dossier
prose states in sentences and recomputes every one from the dataset. It fails
the build when a number in a sentence stops matching the number in the table.
It has caught four figures that drifted when the calibration changed, and it
caught the bug that drew the ten o'clock morning peak under the midnight label
because JavaScript orders an object's numeric keys before its string keys.

## What was wrong, and what fixed it

Two review rounds read the built site rather than the code. The first returned
fifteen material findings: an hour axis ten hours out of order, one zone's
bars painted over the other's, a hub square buried under the first gate, a
money figure overflowing its panel, a verdict band stopping mid-sheet, an empty
price scale, yellow citation chips on every source id, tables clipping
mid-word on a phone, a dark colour scheme on a light document, unstyled filter
controls, a stamp the direction had refused, a duplicated font weight that
meant a 500-weight mono never existed, parameters set in the wrong face, a
promised margin column that did not exist, and a perspective tilt that fought
the world's own rule.

The second returned four more: gate names clipped to ellipsis by the margin
column taking their width, the published price list printed over the scale's
tick notes, a table column collapsing to one character per line on a phone,
and the five published prices carrying no service and no source id.

Nineteen findings, all fixed. Two of them were contract questions rather than
code questions — the world record claimed a set of yellow uses that the build
did not match, and the product record described a table behaviour the build did
not have — and in both cases the contract was amended rather than the build
quietly adjusted, because a record that lies about itself is worth less than
no record.

A final pass drove the site rather than reading it. `verify-interactions.mjs`
filters the decision board and checks the arrow moves, filters to a combination
that matches nothing and checks the empty state appears, clears the filters and
checks all fifteen gates come back, clicks a corridor button and checks the
heading lands below the gantry, reads the focus order, walks the report into
the dossier and back out, and fails on any console error. The palette was
measured against itself: every ink clears 4.5:1 on white and 3:1 on the yellow,
after one source id was found at 3.62:1 and moved to an ink that measures
5.38:1.

## Where the corpus is still soft

The dossier is a model, and the model says so. Zone A's household base is
modelled from a built-footprint archetype, so its quantities are tier C and its
absolute level is not as firm as its ranking. The OMR corridor's twenty-one
minutes between stops is a uniform figure carried from the research pass, not a
measured one. No figure in the corpus is tier A. And nothing here proves an
owner will pay Rs 1,199 for an extended consultation — that number has to come
out of a pilot, not out of a spreadsheet.

A document that hides those things is worth less than one that prints them.
