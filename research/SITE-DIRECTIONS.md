# Site directions — the mobile veterinary data showcase

## What is being designed

The surface is no longer one ten-table report. It is a data showcase over a fixed corpus of 100 scored localities, and every direction below is judged against that corpus, not against a mood. All figures quoted in this document are read directly from `research/zone-a/localities.json` and `research/zone-b/localities.json`. Nothing here is illustrative.

**The corpus, in numbers.**

- 100 scored localities in two zones: Zone A, the south-east cluster (hub Velachery), 50 rows; Zone B, the OMR and ECR corridor (hub Sholinganallur), 50 rows.
- 15 route clusters: A-R1 through A-R8, B-R1 through B-R7.
- 34 ward strings across the two zones. Nineteen in Zone A, including Tambaram City Municipal Corporation and the Kanchipuram and Chengalpattu panchayats outside GCC limits. Fifteen GCC wards in Zone B: 180, 181, 182, 185, 186, 187, 188, 191, 193, 194, 195, 196, 197, 198, 200.
- 615 named-competitor rows across the 100 localities, resolving to 39 distinct name strings that merge to roughly 30 operators. Only eight operator price points are published and recorded: Rs 50 (GCC Veterinary Pet Clinic and ABC Centre, Meenambakkam), Rs 150 (D G Veterinary Clinic), Rs 299 (Little Angels Pet Clinic), Rs 350 (AURO PET CLINIC), Rs 399 (Vetic), Rs 500 (R.K. Pet Clinic), Rs 599 (EASZO Petcare), Rs 699 (ThePetNest). The only market line above Rs 2,000 is home euthanasia, median Rs 6,800.
- One price floor and one cost, identical in all 100 rows: blended floor Rs 1,100, clustered cost per visit Rs 850.
- Verdicts. Zone A: 1 GO, 5 HOLD, 44 NO-GO. Zone B: 46 GO, 4 HOLD, 0 NO-GO.
- Provenance. Population is tier C throughout Zone A (household base modelled from a built-footprint archetype density, plus or minus 30 percent) and tier B throughout Zone B (households allocated from the GCC residential property-tax ledger and Census 2011 Corporation population, plus or minus 25 percent). Every price in the corpus is tier C.
- Seasonality exists in only one zone. Zone B carries a real curve (Jan 121.5, Dec 113.2, Jul 79.1). Zone A carries none: every month is a flat 120 and January is -120. Zone A's month axis must not be drawn.
- Peak windows: 10:00 to 16:00 in 50 of the 100 localities, 09:00 to 12:00 in 47.
- Aggregate hour-of-day shares: 11:00 9.11 percent, 10:00 8.77, 15:00 7.17, 12:00 6.89, 16:00 6.86, 09:00 6.74.

Three constraints follow from that corpus and bind every candidate: the tier mark must travel with the number it qualifies, never in a footnote; the appendix must stay scannable at 100 rows and legible at 360px without horizontal scroll; and the site's headline claim is comparative and uncomfortable — Zone B clears the floor on 46 of 50 localities, Zone A clears it on 1 of 50 — so the world has to hold a GO and 44 NO-GO stamps in the same visual grammar.

---

## The seven grounded candidates

### 1. The Greater Chennai Corporation ward office and its property-tax ledger

**World.** Municipal paper: buff triplicate carbon forms with a faint columnar-pad tint, a blue-black ballpoint, a red grease pencil for PENDING, and a round council seal in dull green ink. Ground is manila buff `#EDE4D2`, ruled in a pale ledger blue; the duplicate copies sit on a faint cyan tint. Type voices are three: a bilingual form face set in English and Tamil for the field labels, a plain typewriter serif for the typed entries, and a mono for what only a clerk would key — ward numbers, survey numbers, PIN codes, receipt serial numbers. The one signature is the seal: a round, slightly misregistered council stamp whose tier is carried by its ring density, solid for sourced, hatched for derived, dotted for modelled.

**First viewport.** The reader stands at a counter. The masthead is the counter board: a rounded rectangle of buff board with the GCC round seal and the ward office name, above a typed FORM heading on a buff sheet that begins with the report title in the form's own field-label rhythm (Subject / Area / Decision / Prepared). The verdict is not a stamp but a counter decision: the decision cell of the form is ticked and initialled, sitting above a ruled cell that holds the key figure, Rs 1,480 blended against Rs 850 clustered cost and the Rs 1,100 floor. The reading column is the form body at a 65-character measure, with a clerk's margin column down the right carrying unit conventions and tier notes. The way forward is the ward clipboard hanging at the left edge: a list of wards and their tab numbers.

**Signature interaction.** The ward seal. In the appendix, choosing a ward re-seals the register: the selected ward's stamp impression presses into the sheet, and every row belonging to it carries that impression in its provenance cell. Used once, in the appendix toolbar.

**Cross-surface reach.** A future route per ward is a ward ledger page. A locality page is a property-tax assessment card. The route cluster page is a collection register with a per-cluster seal. The whole site is one ward office with many drawers.

**Honest risk.** It makes a commercial decision look like a civic formality, and the reader's question is not civic. Worse, a municipal register implies the numbers are a public record; they are not. Zone A's 44 NO-GO verdicts are the model's verdicts, not the Corporation's findings, and a ward-office grammar will quietly launder them into civic authority. This is the failure the brief names: bureaucratic rather than analytical.

### 2. The statistical handbook and census atlas

**World.** A government statistical publication: bright uncoated paper, a running head on every page, a footnote apparatus, notes beneath tables, unit conventions stated once in a preliminary note and never repeated, and a back-matter source list. Ground is plain white `#FFFFFF` with black ink and one red for provisional figures. Voices are a Times-adjacent book serif for prose, a grotesque for running heads and table stubs, and a mono for the figures themselves. The signature is the footnote rule: a short hairline above the notes, and a superscript that resolves to a numbered entry.

**First viewport.** The half-title and the contents, then the summary table. The verdict is a highlighted row in a summary table, not a stamp; the key figure is a table cell with a heavy rule above it. The reading column sits at 62 characters with the running head carrying the section name at every page break. The way forward is the contents list, set as a table of contents with dot leaders.

**Signature interaction.** The footnote apparatus. Pressing a superscript opens the source inline as an expanded note beneath the paragraph, with the full URL in mono, without leaving the page.

**Cross-surface reach.** A statistical handbook has no pages, only sections and tables, so every future route is a table annex. The 100-row register becomes Table 4.1 with its notes and its sources under the rule.

**Honest risk.** This is what the category ships. The self-check must reject the build if it lands here unprompted: a ruled table, a running head and a footnote apparatus is the default appearance of a serious data site and carries no point of view. The deeper cost is that the handbook cannot express what this product actually is. The report's distinguishing mechanism is not sampling, it is attribution to named operators — Little Angels at Rs 299, Vetic at Rs 399, EASZO at Rs 599, ThePetNest at Rs 699 — and a handbook hides that inside a frame. The reader finishes knowing what was counted and not who counted it.

### 3. Chennai's flood and cyclone ward atlas

**World.** A hazard sheet: a printed ward map of the Chennai coast with contour bands in a deep blue to teal to sand ramp, water-level stations as triangles, a hatched legend, a north arrow, a scale bar, and a datum line stated once. The map panel carries the colour; the surrounding page is white with black ink. Voices are a cartographic grotesque for map labels, the legend and the station readings, a serif for the note text, and a mono for station identifiers and depths. The signature is the contour band: value is read as position on a gradient, never as a length.

**First viewport.** A full-bleed ward sheet covering both zones at ward scale, with the title set inside a real map title block — bottom right, boxed, with the scale and datum below it. The verdict is a value in the title block: the corridor's standing relative to the floor, stated as a position on the gradient. The reading column becomes a margin strip of printed notes beside the map. The way forward is the map itself, which is clickable ward by ward.

**Signature interaction.** The gradient scrub. One slider walks the reader through a single variable at a time across all 100 localities — cases per month, households, our-mix blended price, saturation index — and the contour bands re-derive live, so the reader can see that Zone A's low blended prices and Zone B's high ones are a geography, not a coincidence.

**Cross-surface reach.** Every future route is a map sheet at a different zoom: zone, cluster, ward, locality.

**Honest risk.** A ward choropleth of a market will be read as a claim about flood risk in that ward, which this site cannot support and would be a factual error to imply. There is a second, harder failure sitting in the data: Zone B's households do not tile their wards. The five Madipakkam localities in ward 187 are allocated 13,621 households against ward 187's own census-derived total of 2,494. A choropleth that looks authoritative is mis-tiled on its face, and the caveat that says so would have to be printed on the map itself.

### 4. The newsprint data desk

**World.** A broadsheet data page: hairline rules between every block, a results table in tiny condensed tabular type, a small ward choropleth boxed in the sidebar, a footnote rule, a byline, and a "STATS" tag. The ground is newsprint off-white with a faint ink-bleed and a slightly grey cast, the ink is a warm black, and one spot colour is used for a single highlight rule. Voices are a broadsheet book serif for prose, a condensed grotesque for the table, and a small tracked mono for the labels and tags. The signature is the footnote rule at the foot of every table.

**First viewport.** A broadsheet column with no hero at all: a masthead band, a rule, a headline, a deck, a byline, and then the data table, because in a newspaper the table is the article. The verdict is a highlighted cell. The reading column is narrow, set in a measure of roughly 60 characters, with the sidebar taking the figures. The way forward is the cross-reference.

**Signature interaction.** The cross-reference jump. Selecting a table cell highlights its counterpart in the narrative and in the chart simultaneously, the way a broadsheet analysis piece links a number to its sentence.

**Cross-surface reach.** A section is a page; the appendix is a data page with a running head.

**Honest risk.** This is the training-data default. Hairline rules plus tiny tracked mono labels is exactly the look a model produces when told to make a serious data site, so the build will drift here without being asked. **Self-check: this candidate is rejected if the built page can be mistaken for a newspaper data page.** It was not asked for; it arrived unprompted, which is the definition of the default. A second risk: broadsheet pages are built for a broad audience on a desk, and this reader arrives alone on a phone from a chat link. Small type is exactly wrong for that journey.

### 5. The surveyor's field book and chain survey

**World.** A field book: cream plan sheets with a printed grid, iron-gall blue ink that has browned at the edges, peg marks along a chain line, bearings and distances in a running column, a compass rose, a scale bar, a narrow italic field-note column, and inspection marks in red. The cover is cloth-bound and creased. Type voices are a technical sans for plan labels and the dimension column, a cursive-adjacent italic for field notes, and a mono for bearings in degrees and minutes. The signature is the chain line: one measured line crossing the sheet, everything else hung from it.

**First viewport.** A plan sheet. The title is not at the top but in a title block at the bottom right, because that is where a drawing puts it, with the scale bar and the datum beside it. The verdict is a dimension call-out on the drawing itself. The reading column is the note strip down the left. The way forward is the chain line, which traces the route.

**Signature interaction.** The chain. Dragging a route cluster's chain across the plan re-draws the measured length and the run time, and the localities along it re-space themselves along the line in travel order.

**Cross-surface reach.** Every route cluster is a plan sheet; a locality is a station on the chain; the site becomes a set of drawings with a text index.

**Honest risk.** It is an instrument, not a document, and on a reading surface an instrument comes back as costume: graph paper, compass roses, ink washes, none of which carries 7,000 words or a 100-row appendix. The deeper risk is false precision. The route model is a model; the OMR village coordinates are accurate to roughly 700 metres. Drawing a chain survey of it implies a measured accuracy the corpus does not have, and the site would be asserting a survey it never ran.

### 6. The veterinary dispensary clinical record

**World.** The subject's own world: a bound dispensary register on buff paper, a wall dose chart, a cold-chain log, expiry stamps, a weight graph pinned by the door, a copper name plate, a ballpoint pen, a red grease pencil, and paper clips holding invoices to the page edge. The ground is register buff `#F1EDE3` with a ledger rule in pale grey-blue; the current working sheet is a brighter inserted form `#FBF9F3`; the duplicate copy sits on a faint carbon tint. Ink is ballpoint blue-black `#16191F`. Three signal colours and no more: clinical green for a cleared line, red grease for a stock-out or a rejected line, and copper for the name plate and the section tabs. Tier C is not a colour at all — it is a dotted rule. Type voices are two and no more: a book serif for prose and headings, and a mono for every numeral, parameter, ward code, PIN code, unit convention and small label. The signature is the stamp: provenance is carried by a rubber-stamp impression whose ring is solid, hatched or dotted for tier A, B or C, and the hand appears only as annotation — a signature stroke, a pencil tick, a grease cross — never as running text.

**First viewport.** The reader stands at the dispensary's own register, open on the current sheet. The masthead is the copper name plate, embossed, carrying the report title; beneath it a typed subject block on the form — Subject, Area, Decision, Prepared, Dataset (100 localities, 2 zones, 15 route clusters, 615 competitor rows). The verdict is a rubber stamp impression, slightly rotated and slightly off-register, reading the decision for the corridor, placed above the key figure rather than beside it: Rs 1,480 blended against Rs 850 clustered cost and the Rs 1,100 floor, drawn on a ruled ledger scale with three labelled ticks. The reading column is the form body at 65 characters with a margin column down the right that holds the clerk's notes, the unit conventions and the tier legend. The way forward is the binder's spine: ten tabs down the fore edge, the current one extended.

**Signature interaction.** The day log. In the demand division and nowhere else, the 24-hour curve is not a chart but a ruled day sheet with one column per hour; the reader drags a pen along the columns and the ink line draws live while the running total, the peak band and the roster reading stamp themselves onto the sheet. Used once.

**Cross-surface reach.** The binder becomes the site. Ten tabs become ten routes; a locality page is a case sheet pulled from the binder; the route cluster page is a route card; the source list is a docket drawer.

**Honest risk.** It can turn a capital decision into a pet's medical record. The register grammar invites the reader to feel for the animal rather than for the route, and the site's hardest job is to say plainly that 44 of 50 Zone A localities fail the Rs 1,100 floor, that the market floor is structurally loss-making, and that Zone B's cost advantage is unverified. A warm, patient-facing paper world softens exactly those sentences. If the build drifts into clinic branding — paw marks, a cross symbol, mint, a friendly voice — the report's candour is lost and the site becomes marketing for the practice rather than evidence about it.

### 7. The Tamil cinema hoarding

**World.** Offset litho street poster: huge crowded lettering in three or four competing styles, register clashes of magenta, cyan and yellow, coarse halftone dot screens, a torn corner, hard-edged colour blocks, a burst for the special offer, and a photo cut-out with a knocked-out white edge. Voices are a condensed display lettering for the head, a second bold for the sub-head, and a small mono for the fine print, which is where a poster hides its terms. The signature is the halftone dot, which resolves into an image only when you step back.

**First viewport.** A hoarding wall. The title is the largest element in the city. The deck sits under it in a second, conflicting style. The key figure is a burst. There is no reading column and no way forward except the poster itself.

**Signature interaction.** The torn corner. Pressing the tear peels the sheet back to reveal the terms and conditions on the reverse.

**Cross-surface reach.** None that survives. Every future route needs a new poster, and a hundred-row appendix cannot be posterised.

**Honest risk.** The corpus is numbers, all of them, and a hoarding is the one grammar that cannot carry a number without turning it into a claim. Its register is the register of a discount: an offer, a burst, a guarantee. The report says the opposite — that the market floor is loss-making and that 46 of 50 corridor localities clear a floor that 44 of 50 south-east localities do not. A poster grammar would libel the tone of the document.

---

## The six catalog challengers, fused with the product

Each challenger is first fused with this corpus — what it becomes when it is asked to hold 100 localities, 615 competitor rows, a 24-hour curve, a 12-month index and a verdict. Only then is the fused result judged against the assigned direction (candidate 6, the veterinary dispensary clinical record) on two axes and no others: audience identification, and product clarity. Each verdict is fixed before any borrowing is considered.

### Challenger 1 — Iridescent cloud edge

**Fused with the product.** The corpus contains a genuinely meteorological pair: an aggregate hour-of-day curve and a 12-month seasonality index. The cloud world's control vocabulary maps onto them almost literally. Adjust droplet distribution becomes adjust the household-density archetype (Zone A's base is a footprint times an archetype density, plus or minus 30 percent). Compare images becomes compare two localities. Inspect absent, forming, vivid, dispersed becomes inspect the tier states A, B and C. A white cloud ground with slate ink and a mint-rose-violet hairline fringe is a legible ground for a hundred-row table.

**Audience identification.** Weak. A pastel fringed science-explainer says "data journalism", and a founding team reading it will treat the numbers as commentary in a piece about them rather than as a dossier they are being asked to act on. It also says nothing about veterinary practice, and the corpus's whole claim is that the analysis is anchored to what named Chennai operators publish.

**Product clarity.** High on the table, contested on the marks. The fringe as active band competes directly with the A, B and C provenance marks, and there is no absent state to inspect: every one of the 100 localities has a record, so a third of the control vocabulary addresses nothing. The one thing it does better than any other challenger is uncertainty as geometry rather than as text.

**Verdict: declined.** The fringe spends the mark budget that the corpus needs for tier provenance, and the science-explainer register does not identify the trade.

**Discipline the assigned direction lacks:** a first-class, adjustable representation of uncertainty, where the reader sees the band the model itself states and can move between the band and the point estimate.

### Challenger 2 — Brick build-instruction book

**Fused with the product.** The corpus is an assembly order. Each of the 15 route clusters is a numbered sequence of localities in travel order — B-R7, anchored Thiruvanmiyur, is six localities carrying 8,543 modelled cases a month and Rs 1,21,68,461 of monthly revenue — and each locality is a numbered step with its own cases, households, blended price and saturation index. The brick world's oversized step numerals, wordless arrows, stud grid, parts inventory and 1:1 call-outs are a precise description of that structure. Sky blue ground, black keyline, brick red for the new part and yellow for held inventory would also give the register a status legend for free.

**Audience identification.** Weak, and the weakness is categorical. A brick build-instruction book is a construction set, and a founding team arguing about capital will not identify their market dossier with a construction set. There is a second mismatch that is fatal on its own: brick red marks the new part and yellow marks held inventory, and this corpus has no recency axis. Nothing here is new and nothing is held. The legend would encode a dimension the data does not have.

**Product clarity.** Excellent for the route sequence and the parts inventory, and unusable for the hundred rows: 1:1 call-outs at 100 rows is a comic strip, and a stud grid at 8px locks the layout to a modular object rather than to a reading measure.

**Verdict: declined.** The object world is a costume with an audience problem, and its colour semantics do not fit the data.

**Discipline the assigned direction lacks:** an exploded, numbered, ordered representation of a multi-stop route — the cluster as a build sequence with its steps and its assembly total.

### Challenger 3 — Ikeda datamatics

**Fused with the product.** A pure black and pure white terminal with no grey and no colour, pixel-crisp bars, hairline rules, monospace numerics, navigation by data column, frequency band and frame index, and the controls scan, sample and invert. The corpus fits it almost perfectly. The 615 competitor rows are a barcode field. The 24-hour curve is a sine lattice. The 100 localities are 100 columns in a frame index. The prohibition on grey and colour is, on this corpus, an advantage rather than a restriction: it forces provenance tiers to be carried by marks — solid, hatched, dotted — which is exactly the discipline the corpus needs and which most palettes get wrong. The invert control is a genuinely useful accessibility affordance for a table read on a phone.

**Audience identification.** Mixed. An instrument reads as evidence-grade, and the internal R&D team slicing for route design will feel at home immediately. But a partner arriving from a chat link is looking for a document to argue about, and a terminal on a phone does not promise one. The PDF twin decides it: the product ships a print route as a first-class output, and a terminal cannot become a printed document.

**Product clarity.** The highest of the six, by a clear margin. Pixel-crisp bars, monospace numerics and column-addressed navigation are precisely what a hundred-row appendix, an hour curve and a month index need.

**Verdict: competitive.** It is not worse than the assigned direction; it is different in kind. It wins on clarity, loses on the printed-document half of the product and on the argument-in-a-room audience, and it is already adjacent to the incumbent's black ground, so adopting it would be a lateral move inside the incumbent's territory rather than a replacement of it.

**Discipline the assigned direction lacks:** the strictest mark-not-hue tier coding, and an on-demand full inversion for the hundred-row appendix. Detail borrowed below, not a raise.

### Challenger 4 — Cutting bench select rail (the incumbent, offered back)

**Fused with the product.** The world that shipped: true black ground, flag orange, one condensed grotesk at 78 percent stretch, a perforated film rail crossing every sheet, the current section dropping a folded tape flag over the sprocket holes, sources hung below as trims on pins. Fused with this corpus it becomes a bench for a hundred rows: a perforated rail carrying ten divisions, a punched white window for the argument, orange for the key figure, and 615 trims hanging below.

**Audience identification.** Proven. The shipped build already established that a partner knows within seconds that this is a go/no-go on house-call veterinary practice in two Indian cities and that it rests on a Rs 1,100 blended price against an Rs 850 cost.

**Product clarity.** Strong for the argument, strained by the corpus. Every chart, curve and table in this corpus has to live inside a punched white window with a perforated left edge. A condensed grotesk at 78 percent stretch under coarse film grain will not hold 13px tabular numerals across 615 competitor rows, and the black ground means each figure needs an inverted window, so the appendix becomes a hundred punched windows rather than a register. The world was built for ten tables and 83 sources; the corpus is a hundred localities and 615 competitor rows, and the frame does not scale with it.

**Verdict: declined.** Not because it is weak — it is the strongest thing in the roll and it identified the reader better than anything else here — but because the corpus outgrew its frame, and because a replacement is what this exercise is for. The incumbent owns the black ground, so a second black world is a lateral move, not a replacement.

**Discipline the assigned direction lacks:** sources as countable physical objects in the world, hung from the page below the document, rather than as a list of links.

### Challenger 5 — Civic bureau prospectus, late-modern

**Fused with the product.** Bone-white ground, ink #1B1547, violet #6B5CE7, a teal-to-violet ribbon, six council seals in grey, a sticky bar and bands split by hairlines. The corpus makes the six seals concrete and excellent: they become the six institutions that actually source this material — Greater Chennai Corporation, Census 2011, the OSM extract, the property platforms, the directories, and the model itself. A sticky decision bar carries the verdict and the key figure while a hundred rows scroll under it, and the hairline-split bands divide the argument into sections without heavy rules.

**Audience identification.** Mixed, and it misidentifies in a specific way. A civic bureau prospectus says "a government body publishing about its own area". The reader here is a business deciding whether to commit capital to a private house-call practice. A partner skimming could reasonably read it as a municipal project. Investors and partners, on the other hand, know the register of a prospectus cold, and the violet seal is a familiar Indian document idiom.

**Product clarity.** The best raw table legibility of the six — bone white, one violet ink, hairline-split bands — and the weakest attribution, because a grey seal says "some council" while the corpus's actual claim is that Little Angels publishes Rs 299, Vetic publishes Rs 399, EASZO publishes Rs 599 and ThePetNest publishes Rs 699. A seal cannot carry a price.

**Verdict: competitive.** It ties the assigned direction on the two axes it is weakest on and beats it on one it is strong on; it does not win because its central identity claim is civic and the product's is commercial.

**Discipline the assigned direction lacks:** a sticky decision strip that holds the verdict and the key figure in view while the appendix scrolls, and hairline-split section bands. Detail borrowed below, not a raise.

### Challenger 6 — Boxed software reference manual

**Fused with the product.** Milk acetate over a board of one section hue at full strength, one division per hue from the wheel, Sabon 17/26 at a 62-character measure, Univers heads in a margin column, machine voice in mono, and a stepped tab rail down the fore edge with the current tab extending to become the board. Nothing eases or fades: every change is a 90ms two-frame step. Fused with this corpus it is a manual with ten coloured divisions, one hue per division, and a stepped tab rail that is already the best table of contents anyone has proposed for a hundred-row register.

**Audience identification.** Weak. A software reference manual promises to teach the reader to use a tool. This product is research; a partner expecting a manual will read the first screen as documentation and the arguments inside as features. That is a real misidentification, and it is the same failure as the incumbent's opposite pole — a category default wearing a different costume.

**Product clarity.** Excellent, and the best of the six on reading. The margin-column heads, the 62-character measure and the stepped tab rail are exactly right for a document that is 7,000 words plus a 100-row appendix, and the no-easing rule is correct for a page that must also print.

**Verdict: competitive.** It loses on identification for the same reason the cloud edge does, but loses more gracefully, and its tab rail is a genuine rival to the assigned direction's spine.

**Discipline the assigned direction lacks:** the refusal to ease or fade anything — every state change as a two-frame step rather than a transition — and hue-from-the-wheel as a division identity that survives greyscale printing by changing weight rather than colour. Detail borrowed below, not a raise.

---

## The raises

Three challengers were declined, and each of them holds one discipline the assigned direction does not have. Each is named, and each raises the assigned direction to match.

**RAISE 1 — DISPERSION BAND.** From the cloud edge. Every modelled figure in the corpus is drawn with the band the model itself states: Zone A households and demand at plus or minus 30 percent, Zone B households at plus or minus 25 percent, every price at tier C. The band is set as ruled geometry around the point estimate, with a per-row control that collapses it to the point estimate and back. The tier mark travels with it. This changes how a caveat is read, not what is claimed: the site still does not re-run the model, and the site and the PDF still render from one source.

**RAISE 2 — ROUTE ASSEMBLY ORDER.** From the brick build-instruction book. Each of the 15 route clusters gains an exploded, numbered view of its localities in travel order, each step carrying its own cases per month, households, our-mix blended price, margin over Rs 850 and saturation index, closing on the cluster's assembly total. B-R7, anchored Thiruvanmiyur, runs six localities to 8,543 cases a month and Rs 1,21,68,461. The order is the model's order and is labelled as such; it is not a survey, and the OMR village coordinates behind it are accurate to roughly 700 metres.

**RAISE 3 — THE CLIPPED DOCKET.** From the incumbent's trims. Every source becomes a docket clipped to the page edge: a small paper object with its tier stamped on the clip, its publisher set in mono and its URL live. The source list is a drawer of dockets, countable and physical, not a numbered list at the back. In this corpus that means 615 competitor dockets and a docket per cited document, which is the scale the incumbent's trims were reaching for and could not yet reach.

Detail borrowed from the competitive challengers, explicitly not raises: from Ikeda datamatics, tier codes carried by pure marks — solid for A, hatched for B, dotted for C — and an on-demand full inversion of the hundred-row appendix for phone and low-contrast reading; from the civic bureau prospectus, a sticky decision strip holding the verdict and key figure in view while the appendix scrolls, and hairline-split section bands; from the boxed software reference manual, the no-easing rule, every state change a 90ms two-frame step rather than a transition.

---

## Recommendation

**Dispensary Register** — the veterinary dispensary clinical record, built as a bound register.

Committed in full. The corpus is a clinical corpus: hundred case sheets, a stock register of published prices, a day log, a cold-chain log, a licence pool, a route card, and a docket drawer. That is what the data is, and no other world in this roll is closer to it without pretending to be a civic record, a statistical publication, a newspaper, a survey or a poster.

### Ground, palette and material

Register buff, one ink, three signal colours, one metal, one grid.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F1EDE3` | the register ground |
| `--sheet` | `#FBF9F3` | the current working sheet, inserted forms |
| `--carbon` | `#E6E9EA` | the duplicate copy, second sheets, empty cells |
| `--ink` | `#16191F` | ballpoint blue-black, all prose and rules |
| `--ink-2` | `#464C54` | secondary text, table stubs |
| `--ink-3` | `#7A8189` | marginal notes, tertiary labels |
| `--rule` | `#C6CCCE` | ledger rules, table rules, column rules |
| `--rule-soft` | `#DFE2E3` | inner table rules, grid lines |
| `--copper` | `#9A6E3C` | name plate, section tabs, one-off marks |
| `--grease` | `#A62B1E` | NO-GO, stock-out, expiry, unresolved caveat |
| `--clinic` | `#2C6A4C` | GO, in-stock, verified, cited |
| `--ochre` | `#A97C1C` | tier C modelled, used as a mark and never as a fill |

Copper and ochre are reserved for marks, tabs and labels of 12px or larger and must be contrast-verified at build; ink on paper and grease on paper are the load-bearing pairs. Nothing else is coloured. No orange, because orange belongs to the incumbent and the two grounds must not be confused. No pure black and no pure white anywhere.

### Type

Two voices, and a drawn hand that is not a font.

- Prose and headings: a book serif at 16.5px on a 1.6 leading, 65 to 70 characters. Headings in the same family at semibold, 26 to 30px for section openers, 44 to 56px for the key figure.
- Parameters and figures: a mono at 13 to 14px with tabular figures, for every numeral, every price, every case count, every ward code, every PIN code, every unit convention, every timestamp, every source id and every scale tick. Uppercase at 11 to 12px with 0.08em tracking for small labels. Never for running text.
- The hand: signatures, pencil ticks, grease crosses and the dispenser's underline are drawn SVG paths. The register is a typed transcription; the hand is an annotation. This is the rule that keeps the world from becoming a costume.

### Composition and topology

Ten divisions: Verdict; Route and economics; Zone A register; Zone B register; Price ladder; Licence and cold chain; Demand; Competition; Sources; Method.

- **The spine.** A binder spine down the fore edge, always visible from 1024px up, carrying ten tabs. The current tab extends and takes the sheet colour; a read tab carries a pencil tick. On phones the spine becomes a sticky thumb-strip of ten tabs under the name plate, horizontally scrollable, current tab extended.
- **The margin column.** A 13rem column down the right at 1280px and up, holding the clerk's notes, unit conventions, the tier legend and the caveats that qualify the figure beside them. Below 1280px it folds under the figure it qualifies. It never becomes a footnote.
- **The reading column.** 34rem, centred below 1280px. Ledger rules run the full sheet, not the column.
- **The name plate.** The masthead is an embossed copper plate carrying the report title, over a typed subject block: Subject, Area, Decision, Prepared, Dataset (100 localities, 2 zones, 15 route clusters, 615 competitor rows).
- **The verdict.** A rubber-stamp impression, slightly rotated and slightly off-register, above the key figure: Rs 1,480 blended against Rs 850 clustered cost and the Rs 1,100 floor, on a ruled ledger scale with three labelled ticks. Beside it, in stamped form, the corridor's standing: 46 GO of 50 in Zone B, 1 GO of 50 in Zone A.

### Controls and states

- The appendix filter is a stock-card drawer, not chips: a form with tick boxes for zone, ward, verdict, route cluster and tier, and the active selection stamped. It sits in the spine, always reachable, and its state survives a deep link.
- State is carried by mark, never by hue alone: extended tab for current, pencil tick for read, grease cross for NO-GO, green tick for GO, a clipped docket flag for a caveat.
- Hover or focus on any figure stamps it with its tier — solid ring for A, hatched for B, dotted for C — and its source id in mono.
- Every state change is a 90ms two-frame step. Nothing eases, nothing fades, nothing slides. This is the borrowed no-easing rule, and it is also the correct behaviour for a document that prints.
- **Raise 1, DISPERSION BAND.** Every modelled figure carries its stated band as ruled geometry, collapsible to the point estimate.
- **Raise 2, ROUTE ASSEMBLY ORDER.** Every cluster has an exploded numbered route view.
- **Raise 3, THE CLIPPED DOCKET.** Every source is a docket clipped to the page edge, tier-stamped on the clip, with a live URL.

### The signature move, used once

The day log, in the Demand division and nowhere else. The 24-hour curve is a ruled day sheet, one column per hour, and the reader drags a pen along it; the ink line draws live while the running total, the peak band and the roster reading stamp themselves onto the sheet. The real anchors are visible as it runs: 11:00 at 9.11 percent and 10:00 at 8.77 percent of aggregate demand, the peak window at 10:00 to 16:00 in 50 of the 100 localities and 09:00 to 12:00 in 47. The staffing column as recorded is shown as recorded, with its unit marked unresolved, because it reads 1 at 10:00 in Zone A and 97 in Zone B and the corpus does not reconcile the two.

### Responsive adaptation

- 1400px and up: spine, reading column, margin column and a float column for figures.
- 1100 to 1400px: spine, reading column, margin column folded under its figure.
- 768 to 1100px: spine and reading column; figures break full width; the margin notes fold under.
- Below 768px: thumb-strip of tabs; the name plate compresses to a single line; the hundred-row register reflows into a case sheet per locality — name in serif, then household count, cases per month, our-mix blended price, margin over Rs 850, saturation index, named operators, and the verdict stamp — never a horizontal scroll. The price ladder reflows to operator, price and tier as three stacked fields per entry. The day log scrolls horizontally inside its own ruled sheet, because a 24-column sheet cannot compress, and that scroll is the one place the site is allowed to scroll sideways.

### What it refuses

No paws, no crosses, no mint, no rounded friendly shapes, no patient-facing language. No hero band over stacked cards. No colour used to carry a fact that a mark can carry. No figure shown without its tier. No chart in a zone that has no data for that chart, which means Zone A gets no month axis at all. No bar chart whose axis starts anywhere but zero.

### Why this and not the alternatives

On audience identification it is the only candidate in the roll that names the trade the reader is entering without pretending the reader is a citizen, a statistician, a surveyor or a customer. On product clarity it is the only candidate whose native grammar already holds a hundred rows, a day log, a stock register and a docket drawer without inventing a frame for them. The three things it was missing — uncertainty as geometry, an exploded route, and sources as objects — are taken from the challengers that were declined for reasons unrelated to those three, and are named above so that nobody has to guess where they came from.

The risk it carries is the one named against candidate 6: it can turn a capital decision into a pet's medical record. That risk is controlled by four rules that are not negotiable — no clinic branding, no patient-facing voice, no softening of the 44 NO-GO verdicts, and no chart that outruns its provenance. If the build fails any of those four, this direction is wrong and the civic bureau prospectus is the fallback.
