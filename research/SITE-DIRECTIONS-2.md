# Site directions, round 2 — the re-roll

## What is being designed

The surface is a data showcase over a fixed corpus of 100 scored localities in two zones of south Chennai, and it is read once for a decision. Every figure quoted below is read out of `research/zone-a/localities.json` and `research/zone-b/localities.json`. Nothing here is illustrative, and nothing here may be read as a new claim about the market.

**The corpus, verified.**

- 100 localities. Zone A, the south-east cluster, hub Velachery: 50 rows, 2,71,686 households, 34,728 pet-owning households, 11,576 modelled cases a month. Zone B, the OMR and ECR corridor, hub Sholinganallur: 50 rows, 1,47,113 households, 15,017 pet-owning households, 5,007 cases a month. Corpus totals: 4,18,799 households, 49,745 pet-owning households, 16,583 cases a month.
- 15 route clusters: A-R1 to A-R8 (50 localities) and B-R1 to B-R7 (50 localities).
- Our mix at the route-cluster blended price is Rs 2,23,97,498 a month. The whole market at its own prices is Rs 1,56,93,898.
- Cluster blends: Zone A Rs 1,295 (A-R6 Pallikaranai) to Rs 1,311 (A-R4 Hasthinapuram). Zone B Rs 1,384 (B-R2 Thazhuthendur) to Rs 1,557 (B-R6 Madipakkam). One cost, one floor, identical in all 100 rows: Rs 850 cost per clustered visit, Rs 1,100 blended floor.
- 615 competitor rows resolving to 39 distinct operator name strings. Only eight published prices exist among them: Rs 50 (GCC Veterinary Pet Clinic and ABC Centre, Meenambakkam), Rs 150 (D G Veterinary Clinic), Rs 299 (Little Angels Pet Clinic), Rs 350 (AURO PET CLINIC), Rs 399 (Vetic), Rs 500 (R.K.Pet Clinic), Rs 599 (EASZO Petcare), Rs 699 (ThePetNest). One row is a genuine zero: the GCC Animal Birth Control Centre at Sholinganallur, Div 199, Zone XV.
- Verdicts. Zone A: 47 GO, 3 HOLD, 0 NO-GO. Zone B: 35 GO, 13 HOLD, 2 NO-GO. The three Zone A holds are Kadaperi, Mangadu Industrial Estate (NH-4) and Taramani; the two NO-GOs are Mappedu (13 cases a month, 454 households) and R.M.Z. Ecoworld, Thandalam (4 cases a month, 340 households).
- The verdict is four gates: blended price at or above Rs 1,100, margin over the Rs 850 cost at or above Rs 250, cases a month at or above 40, competition saturation index under 70. HOLD means cases at or above 15 with one gate failed; NO-GO means cases under 15 or margin under Rs 100.
- Competition saturation: Zone A mean 31.8 (range 12 to 59), Zone B mean 59.6 (range 39 to 71). The four Navalur holds fail on saturation alone, at 71 against a limit of 70, because the Little Angels house-call arm is based there.
- Peak hour: 10:00 in Zone A, 11:00 in Zone B. Seasonality: Zone A best January 117.8, worst August 85.0; Zone B best January 121.2, worst July 79.7.
- The strongest clusters: A-R7 Velachery main, 2,600 cases and Rs 33,87,800 a month; A-R5 Medavakkam Town, 2,473 cases and Rs 32,24,270; A-R6 Pallikaranai, 1,968 cases and Rs 25,48,044; B-R7 Thiruvanmiyur, 1,323 cases and Rs 19,01,898.
- One route is 156 visits a month. In A-R7 it earns Rs 70,668 of contribution; in B-R7, Rs 91,728, because the corridor's price is higher.

Three facts bind every candidate below and are the ones a builder must respect.

First, **the corpus's `reason` string never names the failing gate.** Kadaperi's reason reads "23 modelled cases a month from 1,960 households; our-mix blended price Rs 1,308 against a Rs 850 cost per clustered visit (margin Rs 458); saturation index 21 with 4 named operators. Rank 49 of 50" — and says nothing about which of the four gates it failed, although cases a month is 23 against a floor of 40. The string "fail" appears nowhere in either corpus file. Any world that wants to show *why* a row is HOLD has to re-derive the failing gate from the row's own four numbers, and has to mark that derivation as derived.

Second, **the corpus's cases are a ceiling, not a forecast.** Both zone summaries carry the caveat in the same words: "Cases are household veterinary demand, not bookings. They are a ceiling to plan against." A world whose furniture implies live measurement is wrong on the corpus's face.

Third, **the two zones are two separate fields.** Rank 1 of 50 in Zone A is Velachery main at a Rs 1,303 blend; rank 1 of 50 in Zone B is Thiruvanmiyur V.O.C. Street at Rs 1,438. They are not comparable, and no world may put them in one ranking.

---

## The seven grounded candidates

### 1. The registered docket

**World.** India Post registered mail. A manila registered envelope with the two-colour green-and-blue band, a printed "REGISTERED" strip carrying a serial, a rubber date stamp of the office of issue, a blue-black ballpoint; and the docket itself, a multi-part carbon form in three parts — Part A particulars, Part B the article, Part C the counterfoil — ruled into an itemised grid with a signature strip at the foot. Palette: cream `#EFE7D4` ground, India Post green `#12664F` and blue `#14487F` for the band and the two zone rules, one rubber red `#B23A2E` for the date stamp, ink `#1B1D22`. Three voices: a typewriter-adjacent serif for the docket particulars, a plain sans for the printed labels, a mono for serials, PIN codes (600042 at Velachery main, 600041 at Thiruvanmiyur, 600126 at Mappedu, 600097 at Thandalam) and ward numbers (179, 182, 195, 200). The one signature is the docket item: every citation marker in the report is a docket serial, and opening it expands the article's particulars in place — the source name, the URL in mono, the tier, the date received, what the article actually is — without a page change.

**First viewport.** The reader stands at a counter, handing something over. The masthead is the envelope face: the report title written in the courier's hand, the address block reading "To: the founding team / To: any partner who intends to check the reasoning." The verdict is the counter's endorsement, a docket line with the decision, dated and stamped. The key figure sits on the docket's ruled particulars grid in mono: Rs 1,100 floor, Rs 850 clustered cost, the margin. The reading column is the particulars sheet at 64 characters, with the article list in the right margin. The way forward is the envelope's own address block: the nine report sections as nine lines of an address.

**Signature interaction.** The docket item. Used once, in the citation apparatus: the 83 sources hang as a despatch register, each with its serial, its issue date and the article it carries.

**Cross-surface reach.** A route cluster is a registered consignment with its own manifest. A locality is a line on the manifest. The 100-row appendix is the bulk consignment docket. A source is a registered article with a docket of its own. The PDF is the same docket, printed.

**Honest risk.** Registered mail exists to prove that a thing was *dispatched*; this report is about whether things are *true*, and a movement history is not a chain of custody. Worse, the most attractive quality of the world is its period romance, and a founding team deciding how to spend their own working time would be reading a period piece about evidence instead of evidence. The paper would flatter the sources and starve the arithmetic.

### 2. The pairing card

**World.** A club tournament. Cream card stock with a faint blue ruling and a red diagonal for a withdrawal; a wall chart of the field with a magnetic score bar; a wooden arbiter's box with a sand-timer clock; an indelible blue pencil and a red pencil. Palette: ivory `#F6F2E6`, umber ink `#20211C`, one red pencil `#B3372B`, one blue-black `#2B3A63`, and the clock's brass. Voices: a plain grotesque for the field and headings, a book serif for prose, a mono for seed, rank, round, PIN and price. The signature is the pairing card: hovering a station on the field shows the card it would draw — two entrants, a board number, the colour. The 100 localities are the entrants, seeded on the corpus's own rank, and grouped into fifteen tables, one per route cluster.

**First viewport.** The reader faces the wall chart. The masthead is the tournament's own card, with the report title typed on the top slip and the field's name in the grotesk. The field is 100 numbered cards in rank order with a hard seam down the middle, because the two zones are two fields and a Zone A rank 1 is not comparable to a Zone B rank 1. Above the chart, the arbiter's summary: the decision and the five conditions attached to it. Below, the score sheet's first rows, with each row's four gates shown as four small marks.

**Signature interaction.** The pairing card, used once on the field.

**Cross-surface reach.** The appendix is the wall chart. A locality is an individual score card. A route cluster is a table. The sources are the book of the tournament.

**Honest risk.** Chess ranks absolutely and the corpus's ranks are within-zone prizes, so a single wall chart silently makes two different scales look like one. The larger damage is tonal: a tournament turns NO-GO into a defeat and HOLD into a withdrawal, and neither is what the corpus says. Kadaperi is HOLD because one gate of four failed on case volume — 23 against 40 — not because it withdrew. A pairing card would dress a case-count artefact as a sporting result, and the corpus's reason string gives the arbiter nothing to write on the card.

### 3. The share register

**World.** A housing co-operative's share register and allotment passbook. Pale green passbook stock with a printed folio grid, entries in blue-black fountain script, a red overdue stamp, a buff share certificate in a folder, a carbon allotment slip, a brass society seal. Palette: passbook green `#E9E5D3`, ledger rules in pale blue `#9FB4C4`, ink `#1E2430`, overdue red `#9E2B22`, brass `#96762F`. Voices: a book serif for prose, a society grotesk for headings, a mono for folio, share, PIN and price. The signature is the folio: open a locality and its folio opens, every apartment block a row, the household count and the pet-owning share beside it, the monthly revenue potential as the dues line and the contribution as a balance brought forward.

**First viewport.** The reader stands at the society's table with the register open. The masthead is a ruled "PARTICULARS OF THE SOCIETY" block on the cover label: name, area of operation (two zones, 100 localities, 15 route clusters), object (a market assessment), date. The verdict is the society's resolution, quoted into the register with its resolution number. The key figure is the subscription due: Rs 1,100 a month against the Rs 850 cost. The reading column is the register's ruled page at 65 characters with the arrears column at the right. The way forward is the index of folios.

The corpus supplies the world with unusual fidelity. Velachery main alone carries 20 apartment complexes, 310 gated-community projects and 8 pet-friendly associations, against 196 flats listed on the same MagicBricks page, with named clusters including Propshell Swastika, Iyra Spire, Brigade Stellaris (284 units on 5.19 acres), Tulive Urbanville and Jcube Prime Avenue. Thiruvanmiyur V.O.C. Street carries 31 apartment complexes and 34 gated communities; Perungudi Bethel Nagar, 13 complexes and 32 gated communities; R.M.Z. Ecoworld, none at all.

**Signature interaction.** The folio, used once, on a locality page.

**Cross-surface reach.** A locality is a folio, a route cluster a scheme, the appendix the members' register, a source an audited paper.

**Honest risk.** A co-operative says "we are members and we pay a share", which is the opposite of this product: the practice sells a visit to households that are not organised, and 49,745 pet-owning households out of 4,18,799 is a denominator, not a membership. The register would make the reader hunt for a collective to sell into, and it would make the market floor's loss-making look like a dues collection problem rather than a price problem. A passbook also promises exactness the corpus cannot keep: Zone A's household base is tier C at plus or minus 30 percent, Zone B's tier B at plus or minus 25 percent.

### 4. The signal cabin and the block register

**World.** An Indian railway signal cabin on a single-line section: a riveted steel relay case, a grey enamelled lever frame, an ivory ruled register book with a red column rule, a brass token on a chain, a green-shade desk lamp, a wall telephone. Materials: enamelled steel, ivory register paper, brass, black lead pencil. Palette: register ivory `#F4F1E7`, steel grey `#D8D6CC`, ink `#1A1B18`, signal red `#A62B1F`, caution amber `#C08A1E`, signal green `#1E5E3E`, brass `#96762F` for the token. Three voices: a book serif for prose at 16.5px on a 62 to 70 character measure, a condensed grotesk at 74 percent width for the display figure and the block names, a mono for every numeral that is a fact — cases, prices, hours, distances, PIN codes, ward numbers, source serials — and never for running text. The one signature is the signal post and its aspect, drawn in SVG: an arm on a post whose *position* states the state, so hue is the redundant channel and never the only one.

**First viewport.** The reader stands at the cabin desk. The masthead is the cabin's enamel identity plate carrying the report title and the two zone names. Beneath it the block diagram: a single horizontal schematic of the whole corpus as fifteen block sections — A-R1 to A-R8, then B-R1 to B-R7 — with a signal post drawn at every boundary, and the two hubs named as the termini, Velachery and Sholinganallur. The diagram is the only navigation. To its right, the verdict: the aspect of the signal that governs the report, drawn and then written as a word. Under it the key figure, in mono on a price ladder that ticks all eight published operator prices — Rs 50, 150, 299, 350, 399, 500, 599, 699 — with the Rs 850 cost and the Rs 1,100 floor marked above them. The reader therefore sees, in the first screen, that the highest home-visit price any Chennai operator publishes is Rs 699 and that making one costs Rs 850. Below, the Train Register Book page opens at 64 characters with a right-hand remarks column. The way forward is the movement order down the left: the nine report sections as a station master's order of movement.

**Signature interaction.** The token. A brass token hangs from the masthead and can be set at any price on the ladder — any of the eight published operator prices, the Rs 850 cost, the Rs 1,100 floor, or a block's own blend. When it moves, every one of the fifteen posts re-reads itself as the margin over that token: A-R7's Rs 1,303 blend sits Rs 604 above ThePetNest's published Rs 699 and Rs 453 above the Rs 850 cost; B-R7's Rs 1,438 sits Rs 739 above the same and Rs 588 above the cost. This is arithmetic over the corpus's own values and no new claim. Used once, on the opening screen; nothing else in the system moves.

**Cross-surface reach.** A route cluster is a block section with its own register page carrying its anchor, cases, blend, revenue and contribution. A locality is a station on the section, with its four gates shown as four marks. The 100-row appendix is the Section Register, one ruled table of 100 stations in travel order. A source is a traffic message in the despatch register. The PDF is the same book printed with the diagram flattened to a plate.

**Honest risk.** A signal states a condition and never argues, and this report has to argue: why a route in the corridor earns Rs 91,728 of contribution against the south-east's Rs 70,668 when the south-east holds more prize, why the licence bundle at Rs 899 is 27.65 percent of Velachery main's own mix, and why three compliance questions stay open. The deeper risk is that a lit post reads as a live feed. The corpus says the opposite in its own caveat — cases are a ceiling to plan against, not bookings — and a signal cabin is the one world where everything looks like it is happening now. The mitigation is real (every aspect plate carries its tier bracket and the word MODELLED) but it is a mitigation, not a cure.

### 5. The bill of quantities

**World.** A public works tender: A4 sheets with a printed border and a perforated binding edge, a red TENDER stamp across the head, a security deposit receipt, a site measurement book, a quantity take-off. Palette: white `#FBFAF6`, hairline rules in `#2A2A28`, one red `#9E2B22` for the stamp, one blue `#1F4E79` for the rate-analysis column, blue-black ink for signatures. Voices: a book serif for prose, a grotesk for the item schedule, a mono for rates, quantities and amounts. The signature is the rate analysis: click an item and its rate unpacks into unit rate, quantity, amount and share.

The corpus is a schedule of rates already, and it is worth seeing how literally. Zone A's market mix is the same ten lines at the same prices in all fifty rows, with only the shares moving by locality — Tambaram West's shares are: general home consultation Rs 699 at 32.88 percent, extended home check-up with blood panel Rs 1,699 at 15.75, chronic monitoring Rs 1,199 at 6.97, senior wellness bundle Rs 1,999 at 3.90, vaccination at home Rs 599 at 23.76, licence compliance Rs 250 at 4.67, clinic outpatient Rs 800 at 3.82, diagnostics add-on Rs 1,200 at 6.57, hospitalisation Rs 2,500 at 1.53, and at-home euthanasia Rs 6,800 at 0.15 — the only market line above Rs 2,000. The corridor's market mix is a different schedule altogether, again identical across its fifty rows, and Thiruvanmiyur's shares are: home consultation Rs 399 at 26 percent, home vaccination Rs 599 at 22, home sample collection Rs 199 at 9, home health check-up package Rs 999 at 12, deworming Rs 699 at 9, senior wellness Rs 1,199 at 8, home euthanasia median Rs 6,800 at 2, post-operative revisit Rs 899 at 7, and a pet licence visit at Rs 299 at 5. Our own ladder differs again by zone, and is identical in price across each zone's fifty rows: at Velachery main, Rs 1,699 for the extended consultation, Rs 1,199 for a chronic visit, Rs 825 for chronic monitoring under an annual plan, Rs 1,999 for the senior wellness bundle, Rs 899 for vaccination, Rs 899 for the licence-compliance bundle and Rs 8,150 for at-home euthanasia, where that licence bundle alone is 27.65 percent of the mix; Rs 1,399, Rs 2,499, Rs 8,900, Rs 1,299, Rs 699, Rs 1,199 and Rs 1,899 in the corridor.

**First viewport.** The reader holds the tender's front sheet. The masthead is the notice inviting tenders, carrying the report title. The verdict is a line in the general summary: launch in Chennai only, above Rs 1,100. The key figure is the total: Rs 2,23,97,498 a month on our mix against Rs 1,56,93,898 at the market's own prices. The reading column is the particulars narrative at 60 characters. The way forward is the index of items.

**Signature interaction.** The rate analysis, used once, on the schedule.

**Cross-surface reach.** A route cluster is a work package with its own take-off, a locality a site with a measured quantity, the appendix the schedule of quantities, a source a particular of the tender.

**Honest risk.** A tender invites bids; the report is a recommendation to the people who must fund it, so the document's own grammar says the reverse of what the reader needs. And a schedule of quantities counts material by unit, which would assert exactly what the corpus refuses: "General home consultation, 30 minutes, unit rate Rs 699, quantity 11,576" states a countable unit of clinical work — and 11,576 is Zone A's modelled cases a month, a ceiling and not an order book, and the corpus's caveat is that cases are a demand ceiling and not bookings.

### 6. The cause list

**World.** A court notice board: a printed cause list in three columns, a listing board of case-number slates hung on hooks, a buff file wrapper with pink tape, a rubber ADJOURNED stamp, a vermilion, the court seal in dull green. Palette: buff `#E9E0C8`, ink black, one vermilion `#9E3B2A`, seal green `#3F6B4A`. Voices: a book serif, a court grotesk for the cause-list heads, a mono for case numbers, dates and ward numbers. The signature is the listing: a matter on the board changes its date as the reader reaches the section that bears on it — the licence matter, the price-floor matter, the Coimbatore matter. The board is the report's table of contents.

**First viewport.** The reader stands before the board. The masthead is the board's enamel header with the report title typed on the top slip and the case number in mono. The verdict is the board's disposition: argued, judgment reserved, launch in Chennai only. The key figure is the claim figure. The reading column is the sheet of written submissions at 65 characters. The way forward is the board.

**Signature interaction.** The listing, used once, on the board.

**Cross-surface reach.** Each section is a matter with a listed date; a route cluster is a bundle of exhibits; the appendix is the exhibit index; a source is a citation.

**Honest risk.** This is the worst of the seven for candour. A cause list makes a modelled verdict look like a court's finding, and the report's three unresolved compliance questions would appear as matters awaiting a listing date the site is quietly promising. The report says the licence regime is weakly enforced and that three questions remain open; a legal grammar turns "open" into "pending before a court", which is a different and far stronger claim.

### 7. The policy schedule

**World.** An insurer's schedule: pre-printed clauses in a book serif, a ruled schedule of benefits, a premium receipt book with counterfoils, an endorsement stamp, a fountain-pen signature, a VOID stamp across the counterfoil. Palette: ivory `#F7F3E8`, a deep navy header band `#16324F`, one maroon `#8E2B2B` for the not-covered stamp, black ink. Voices: a book serif for prose and clauses, a grotesk for the schedule, a mono for premium, sum assured and tier. The signature is the endorsement: the reader opens the endorsement register and sees precisely what the report adds to the base — the licence-compliance bundle at Rs 899 in Zone A and Rs 1,299 in the corridor, and the end-of-life line nobody else prices, at a market median of Rs 6,800 against Rs 2,800 in clinic.

**First viewport.** The reader holds the schedule's first page. The masthead is the particulars: the name of the risk (a mobile veterinary house-call practice in Chennai), the area of operation (two zones, fifteen route clusters), the sum assured (one route, 156 visits a month, Rs 70,668 of contribution in A-R7 against Rs 91,728 in B-R7), the base premium (the Rs 1,100 floor) and the loading (the Rs 250 minimum margin). The verdict is the decision line of the proposal form. The reading column is the clause set at 65 characters. The way forward is the schedule of benefits, which is the report's own contents.

**Signature interaction.** The endorsement register, used once.

**Cross-surface reach.** Each section is a clause, a route cluster a location of risk, the appendix the experience table, a source a notice.

**Honest risk.** An insurance schedule promises that a loss is covered, and nothing here is covered: there is no third-party payer in Chennai home veterinary visits, the practice is paid per visit, and the report's own open items are the kind of thing a policy would list as exclusions — which would be an admission the site is not making. "Cover" and "exclusion" are the wrong moral grammar for a decision the reader funds with their own time.

---

## The six catalog challengers, fused and judged

Each challenger is first fused with this corpus — what it becomes when it is asked to hold 100 localities, 615 competitor rows, a 24-hour curve, a 12-month index and a verdict. The fused result is then judged against the assigned direction, **candidate 4, the signal cabin and the block register**, on exactly two axes: audience identification and product clarity. Each verdict is fixed before any borrowing is considered.

### Challenger 1 — Plakatstil object poster

**Fused with the product.** The wall is the map, so the 100 localities become a hundred sheets, each on one of four fixed grounds — ox-blood, mustard, moss, slate — and navigation moves between grounds, so a ground would have to mean a zone or a verdict class. The object redrawn across the sheets is the report's own mark cut from a fat slab alphabet, the brand word locked beneath it. Controls are object emblems; the active one swaps to the house accent.

**Audience identification.** Weak. A saturated poster wall is a gallery, and a founding team reading a gallery does not know it is being asked for a capital decision. The four grounds also sit exactly where the report needs gravity: mustard behind a HOLD row reads as a sale, ox-blood behind a NO-GO reads as alarm. The register is discount, not evidence.

**Product clarity.** Poor. The corpus needs at least three verdict states, three provenance tiers and two zone states; the house set has four grounds, and the poster solves the shortage by repeating grounds rather than by encoding states. A saturated ground under 16px body copy at a 60 to 75 character measure also forces the body colour to be re-derived per ground, and the moment a ground sits under a 100-row register the wall becomes a poster of numbers.

**Verdict: declined.**

**Discipline the assigned direction lacks:** a state change that re-reads a whole unit at once, as a hard cut of the ground rather than a local recolour of one mark.

### Challenger 2 — Centre-rail reference setting

**Fused with the product.** The centre rail becomes the corridor itself: a fixed spine of keys down the middle of every page carrying the four gates and the price ladder, with two text columns set either side. The ruling engine is real — a canvas or SVG layer reads live layout boxes and draws every hairline, detent and bracket at one device pixel, re-solving on resize and zoom — and the states are printed marks: a detent hairline at rest, filled when pressed, run through when disabled, bracketed on focus, struck when spent. No radius anywhere.

**Audience identification.** Neutral to good, and this is the challenger's real strength. A ruled reference setting reads as authoritative and checkable, which is right for a document that will be argued about in a room. But it identifies the genre, not the trade: nothing in it says a veterinary practice in Chennai, and a reader without the memo could take it for a telecom standard.

**Product clarity.** Very high on craft, contested on fit. It is the best of the six at holding a 100-row register at hairline weight and at making focus and disabled states visible, and a bracket vocabulary would be the clearest possible way to show the four gates. But the brief's mode fixes the reading column at 60 to 75 characters, and the centre rail splits the page into two columns of 34 to 40 characters, doubling the eye returns in a 7,120-word document. The rail's own job — a fixed spine of keys — also duplicates what the block diagram does better, because the diagram is the corpus's own topology: fifteen route clusters, two hubs, a travel order.

**Verdict: competitive.** It is the closest challenger to the assigned direction, and the two disciplines it holds best are disciplines the cabin already holds: the ruling engine, because the cabin's register rules are drawn from live layout boxes rather than bordered, and the printed-mark state vocabulary, because every state in the cabin is a drawn arm or a drawn bracket. Nothing is borrowed and nothing is lost.

### Challenger 3 — Miura-fold deployable sheet

**Fused with the product.** The report as a sheet that unfolds from a gold packet: compact packet (the verdict), crease cell (one locality), linked row (one route cluster), fully deployed sheet (the whole 100-row appendix), with mountain creases in warm grey, valley creases in pale blue and the packet face in gold. Controls pull, lock, reverse, inspect; states folded, opening, deployed, misfolded, collapsed.

**Audience identification.** Poor. A gold foil packet unfolding is a gift-object ritual, and the report is not a gift; the world's first gesture is ceremony where the reader came for a problem. The geometry also works against the content: a tessellation's cells are equal by construction, while the corpus's whole argument is comparative: A-R7 carries Rs 33,87,800 a month against B-R7's Rs 19,01,898, and the two zones hold different verdicts, 47 GO and 3 HOLD in the south-east against 35 GO, 13 HOLD and 2 NO-GO in the corridor.

**Product clarity.** Contested. Constraint-linked geometry maps the corpus's real hierarchy — verdict, locality, route cluster, appendix — and does it with one control. But the state list includes misfolded and collapsed, which are error states of a physical thing, and the corpus has no such state: every row is a real record and none of them is a mistake. The report's risk vocabulary needs to say "this number rests on a tier C footprint" and "this row fails one gate of four", not "the sheet is folded wrong".

**Verdict: declined.**

**Discipline the assigned direction lacks:** a single control whose movement propagates through the whole sheet by constraint, with every cell's state derived rather than set.

### Challenger 4 — Daylight section

**Fused with the product.** The page ruled as one long continuous section, with the travelling sunbeam as the live band and shadow blue for withdrawn hours. The band would be the live hour — 10:00 in Zone A, 11:00 in Zone B — travelling along the hour axis while everything else stays fixed, and the reader would change date (January 117.8 against August 85.0 in Zone A; January 121.2 against July 79.7 in Zone B), orientation and opening depth while comparing useful light and glare.

**Audience identification.** Poor to neutral. An architect's section reads as a built-environment drawing; nothing in it says veterinary, market or price, and the whole thing smells of a designer's portfolio piece rather than a decision document.

**Product clarity.** The moving band is the one idea the corpus genuinely rewards: the most-used temporal facts in the corpus are the 24-hour curve (11:00 at 9.11 percent aggregate, 10:00 at 8.77, 15:00 at 7.17) and the peak windows, and a band travelling along a fixed axis is the honest way to show where a distribution's weight sits. The section cut itself is a liability: a section is a drawing of a cut object, so the 83-source apparatus and the ten tables would look like annotations on a building.

**Verdict: declined.**

**Discipline the assigned direction lacks:** a fixed reference band carrying a live position on an axis, so a distribution is read against a scale rather than as a list of numbers.

### Challenger 5 — Hand-drawn technical zine

**Fused with the product.** The report as a hand-lettered zine: nine numbered comic panels for the nine sections, doodle arrows, a mascot, highlighter swipes across the active line, diagrams authored as inline SVG with hand-drawn paths whose doodle arrows draw on with scroll.

**Audience identification.** Weak, and the weakest of the six for this product. A zine announces itself as approachable and fun, in the exact register where the document must be unhedged: the subject is a market floor that is structurally loss-making and a licence regime that is weakly enforced. Nine panels also cannot hold 7,120 words; the panels get longer, not the zine shorter.

**Product clarity.** Contested in the useful direction. The draw-on discipline is the best scroll-linking idea in the set, and the corpus has one thing that genuinely needs to be built rather than shown: the route. A-R7 runs Velachery main, Velachery Ram Nagar North at 0.6 km, Velachery Jaganathapuram and the rest in travel order, with 21 minutes of travel per 25 minutes of clinical work at 6.7 km per visit; a line that assembles as the reader arrives would show the ordering as a consequence rather than as a table of contents. But the mascot's state set — done, warning, gotcha — has no home for the corpus's hardest states: the gate a HOLD fails, the tier bracket on a tier C row, and the three unresolved compliance questions, which are open items and not gotchas.

**Verdict: declined.**

**Discipline the assigned direction lacks:** the diagram assembles itself as the reader arrives, so the structure is read as it is built rather than presented finished.

### Challenger 6 — Normalled jackfield

**Fused with the product.** The 100 localities as lanes on unlit black glass, each tied to its default — its own route-cluster blend — by an amber link line whose pattern carries the state: unbroken is live, one cross-tick is held, a clean gap is disabled, doubled is selected, an open ring is destructive. Rank by inversion, with the dominant block knocked dark out of a solid amber plate. No colour carries state; the lane grid drifts under a fixed left legend strip; a broken link line never animates closed.

**Audience identification.** Mixed, and this is both the challenger's strongest point and its sharpest trap. A black-glass console with amber signal lines reads unmistakably as live operations, and the corpus is emphatically not live: "Cases are household veterinary demand, not bookings. They are a ceiling to plan against." A console grammar tells the reader these are quotes on a feed, which is the one thing the report must not imply.

**Product clarity.** Excellent on state and poor on document. The link-line vocabulary is the finest state encoding in the set and maps nearly one to one onto the corpus: unbroken is a cleared gate, a cross-tick is the one gate a HOLD failed, a gap is a row whose own fill cannot support the route, doubled is the selected row, an open ring is a NO-GO that must not be closed. Rank by inversion is a discipline the cabin lacks outright — a solid plate carrying A-R7's Rs 33,87,800 would say "this is the prize" in a way hairlines cannot. But an endlessly drifting lane grid on black glass cannot carry 7,120 words of prose at 16px on a phone arriving from a chat link, and the drift contradicts the product's own principle of keeping the reader oriented.

**Verdict: declined.**

**Discipline the assigned direction lacks:** dominance expressed as a solid plate with the figure knocked out of it, so the leading block is set by mass rather than by a colour or a label.

---

## The raises

Each declined challenger names one discipline the signal cabin lacks. The signal cabin is raised to match, one named line per raise.

1. **The whole-section cut.** When a block's aspect changes, the entire block section — post, plate, register row — changes in one frame, with no transition, so a state change is never mistaken for an animation. (From challenger 1.)
2. **Consequent marks.** The token is the only movable thing in the cabin; every other mark on the page, from the block aspect to the margin figure, is derived from where the token sits, so cause and effect are visible in the same frame. (From challenger 3.)
3. **The travelling band.** The peak-hour band — 10:00 in Zone A, 11:00 in Zone B — travels along the 24-hour axis of the roster and the staffing table, with the night hours in shadow blue, so the reader sees where the day's weight sits instead of reading an average. (From challenger 4.)
4. **Draw-on.** The block diagram's route lines and signal wires are SVG paths that draw themselves once, on first entry into the section, from the anchor outward in travel order, so the reader sees the route assembled instead of being shown a picture of it. (From challenger 5.)
5. **The knocked-out block.** The leading route cluster, A-R7 Velachery main, is set as a solid brass plate with Rs 33,87,800 a month knocked out of it in the block diagram and the register header, so dominance is a weight in the composition and not a word. (From challenger 6.)

---

## Recommendation — the signal cabin and the block register, with its five raises

**Thesis.** The report is a decision about where and when to run a service, and the corpus already speaks that language: fifteen route clusters, two hubs, a travel order inside every cluster, a blend per cluster, a contribution per route. The signal cabin is the world in which a condition is stated rather than argued, a route is a real thing with an order, and a signal says clear, caution or danger without softening it. It refuses both defaults of this category — a hero band over stacked white cards on a grey page, and a table of charts on a white sheet — and it gives the report's hardest sentences the right hard frame: a caution aspect is caution.

**Ground, palette and material.** One page ground, register ivory `#F4F1E7`, with a steel grey `#D8D6CC` used only for rules, gutters and drawing surfaces. Ink is near-black `#1A1B18`. Three signal inks: red `#A62B1F` for danger, amber `#C08A1E` for caution, green `#1E5E3E` for clear. One metal, brass `#96762F`, reserved for the token, the knocked-out plate and nothing else. No gradients, no shadows, no radius above 2px except the identity plate's own 3px enamel corners, no texture beyond a 2 percent paper grain on the ivory. Every panel, card and rule is a drawn line, never a bordered box; the brief's "one system used where it earns its place" is enforced by there being no box to repeat in the first place.

**Type.** Three voices and no more.

- Body: a book serif at 16.5px on 1.55 leading, measure 62 to 70 characters, near-black on ivory.
- Display and headings: a condensed grotesk at 74 percent width, uppercase, tracked to +4, for the masthead title, the nine section names in the movement order, the block names on the diagram and the key figures.
- Mono: every numeral that is a fact — cases, households, prices, margins, hours, minutes, kilometres, PIN codes, ward numbers, saturation indices, source serials — at 13px with tabular figures; small labels and the tier bracket legend also in mono. Running text is never mono.

**Composition and topology.** Three columns on wide screens: a 14rem movement order on the left listing the nine report sections with the current one marked by a drawn signal arm rather than a colour; the reading column at 40rem (68 characters at the body size) centred in the remaining space; a 20rem right-hand remarks column carrying the register's annotations, the gate marks and the citation serials. The block diagram is a full-width band directly under the masthead, above the reading column, so it is the first thing under the title and the last thing above the fold on a phone. Tables are ruled registers: hairline rules drawn from live layout boxes by an SVG layer at one device pixel, re-solving on resize and zoom, so a rule never doubles and never floats. The 100-row appendix is one ruled Section Register.

**Controls and states.** Every state is a drawn mark; hue is always redundant with shape or position.

- **Aspect.** The signal post, drawn: a red arm horizontal for danger, an amber arm horizontal for caution, a green arm lowered 45 degrees for clear. Used on the fifteen block posts, on the verdict plate and on each row of the Section Register.
- **The four gates.** Each row carries four small marks, one per gate — price at or above Rs 1,100, margin at or above Rs 250, cases at or above 40, saturation under 70. A cleared gate is a filled square; the gate a HOLD failed is an open square with a single diagonal stroke, and the site names which gate it is because the corpus's own reason string does not; gates not reached are hairlines. The derivation is labelled as derived, never as sourced.
- **Provenance tier.** A bracket, not a stamp and not a ring: solid bracket for tier A, dashed for tier B, dotted for tier C. It travels with the number it qualifies, inside the cell, never in a footnote.
- **Confidence.** A pencil underline weight — firm for medium, dashed for low. There are no high-confidence rows in this corpus and the system must not imply otherwise.
- **Focus and disabled.** Every interactive element carries a visible focus bracket and a struck-through state; nothing is expressed by opacity alone.

**The signature move, used once.** The token. A brass token on a chain hangs at the masthead and can be set at any price on the ladder: any of the eight published operator prices (Rs 50 GCC Meenambakkam, Rs 150 D G Veterinary Clinic, Rs 299 Little Angels, Rs 350 AURO PET CLINIC, Rs 399 Vetic, Rs 500 R.K.Pet Clinic, Rs 599 EASZO, Rs 699 ThePetNest), the Rs 850 clustered cost, the Rs 1,100 floor, or any block's own blend. When it moves, the fifteen block posts re-read themselves as the margin over that token, the register's header figure updates to the same number, and the whole page changes in one frame with no fade — the whole-section cut. It appears on the opening screen and in the appendix toolbar. No other control changes anything: the diagram is navigation, the token is the only instrument, and the single exception to stillness is the draw-on entrance, once per section.

**Responsive adaptation.** At 900px the movement order collapses into a sticky position bar carrying the nine section names in small mono with the current one marked; the block diagram turns from a horizontal line into a vertical list of fifteen blocks, still drawn, still with an aspect post each. At 600px the right-hand remarks column folds beneath the reading column, never beside it, and the token becomes a fixed strip at the foot. At 360px the Section Register reflows from nine columns into stacked per-locality cards — name, block, cases, households, blend, margin, saturation, aspect, failed gate — with no horizontal scroll at any width. Body text never drops below 16px and the measure never exceeds 75 characters.

**What it refuses.** It refuses the hero band, the stat-card row, the chart-with-a-grey-grid default, the rounded card, the drop shadow, the pill badge, the emoji, the paw print and the mint-and-white clinic palette. It refuses to colour a state without a shape. It refuses to show a market share, a growth rate or a projection, because the corpus has none: it shows 16,583 modelled cases a month and calls them modelled, and it says in the same cell that they are a ceiling to plan against. It refuses to display the two zones in one ranking.

**The five raises, applied.** The whole-section cut lands on the token move, which re-reads all fifteen blocks and the header figure in one frame. Consequent marks land on the token as the system's only movable thing: every aspect, every margin figure and the register's headline number derive from where it sits. The travelling band lands on the roster: the 24-hour curve for each zone is a fixed axis with a gold band at 10:00 for Zone A and 11:00 for Zone B, the night hours in shadow blue, and the staffing table beneath it carrying the corridor's own numbers — 17.89 visits and 14 staff at 11:00, 15.71 and 13 at 10:00. Draw-on lands on the block diagram: the fifteen route lines draw themselves once from their anchor outward in travel order the first time the section is entered, so the reader watches A-R7 assemble from Velachery main through Velachery Ram Nagar North at 0.6 km and the rest of its seven. The knocked-out block lands on the masthead and the register header, where A-R7's Rs 33,87,800 a month is set as a solid brass plate with the figure knocked out of it, and where the one-route contribution of Rs 70,668 in A-R7 is set against B-R7's Rs 91,728 in the margin beside it, so the heavier prize and the heavier route are read together.

**Why this and not the alternatives.** The registered docket is the best of the seven on provenance and the worst on arithmetic, and this product's second principle is to show the arithmetic. The pairing card and the cause list both turn a modelled verdict into a sporting or judicial result, which is precisely the failure the brief names when it says the surface must present the loss-making floor with the same weight as the recommendation. The share register promises a collective that does not exist and an exactness the tier C and tier B household bases cannot keep. The bill of quantities would count clinical work in units the corpus explicitly refuses to count. The centre-rail reference setting is competitive, and its two best disciplines are already held. What the signal cabin has that no other candidate has is the corpus's own grammar: routes, hubs, a travel order, a blend, a contribution, and a state that is either clear, caution or danger. It also has the right register for candour. A caution aspect does not soften anything, and the report's central sentence — that the market floor of Rs 1,100 sits above the market's highest published home-visit price of Rs 699 and above the Rs 850 cost of making one visit — is a caution, stated as a condition, with no adjective attached.

**The risk that remains.** A signal world implies a live railway. The corpus is not live: cases are a demand ceiling to plan against, and every figure on the site is modelled or derived, never observed in the market except where a named operator's published price is quoted with its name attached. Every aspect plate therefore carries its tier bracket and the word MODELLED, the token's own figure is stated as a comparison against a named published price rather than as a forecast, and the site's opening line says what the numbers are. If the build drifts into a live-feed reading — a green post that looks like a live clearance, a console that looks like a trading screen — the direction has failed, and the self-check is that a reader who has not read the memo should still understand that every number on the page is a model of a market, and that the only things on the page which are observed rather than modelled — Little Angels at Rs 299, EASZO at Rs 599, ThePetNest at Rs 699, the GCC centre's Rs 50 — are observed because a named operator published them.
