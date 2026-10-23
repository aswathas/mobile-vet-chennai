# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro with static output, chosen by the user from a framework option (Astro or Next). Astro over Next because the site is a single document surface with no state, no routing that depends on a server and no data fetching: Astro renders the report's Markdown to static HTML at build time, ships near-zero JavaScript, and emits a `dist/` directory that deploys to any static host without a server runtime. Next would add a server or an export step to deliver the same pages. The PDF is produced separately by printing a dedicated print route of the same build through headless Chrome, so the PDF and the site share one source and one typographic system.

## Users

Two audiences, in this order.

1. **The veterinary founding team and partners, deciding whether to commit capital and their own working time** to a house-call veterinary practice. They need the verdict, the unit economics and the licence position. They will read it once, carefully, and then argue about it in a room.
2. **Investors or partners evaluating the opportunity.** They need to see that the numbers are sourced rather than asserted, and that the downside case was priced honestly rather than buried.

The site has to work for both without splitting into two sites. The sourcing serves the second audience; the decision-grade economics serve the first.

## Product Purpose

The product is the research itself: a market assessment, go/no-go verdict and business plan for a house-call veterinary service in Chennai and Coimbatore, with a city recommendation, a full unit-economics model, a compliance checklist, a launch sequence and 83 cited sources.

It exists so the founding team can make one expensive, hard-to-reverse decision on evidence rather than intuition, and so any partner or investor can check the reasoning instead of taking it on trust. Success is a reader who reaches a decision: launch in Chennai, above a stated price floor, with a specific service mix and a named wedge, or not launch. A reader who finishes without knowing what to decide has failed.

## Positioning

The report's distinguishing mechanism is that every commercial claim is anchored to an observed price or a primary document rather than to a category average, and where the two disagree the report says so and explains which one governs.

Concretely: competitor and consumer sources quote "typical" Chennai home-visit bands of Rs 800 to Rs 2,000. The report instead quotes what Chennai operators actually publish (Rs 200 to Rs 699), then derives the cost of delivering one visit from the city's measured traffic, which lands around Rs 850, and states plainly that the market floor is structurally loss-making. The same discipline runs through the regulatory thread: the Greater Chennai Corporation's own press releases and the live portal workflow, not a commentary piece.

A second anchor is that the differentiation thesis is derived from a clinical fact and a price index rather than from a feature list: a diabetic dog's glucose curve requires six to eight blood samples across a twelve-hour window, which a clinic cannot deliver and a house call can, and Chennai's in-home euthanasia median of Rs 6,800 against Rs 2,800 in clinic is the only price point in the market above Rs 2,000.

## Operating Context

- The report is a finished piece of research, not a living document. It is read once for a decision and occasionally re-read for a specific number.
- The reader arrives from a chat message or an email link, on a phone as often as a laptop, usually alone, with no context from the conversation that produced it.
- The founding team will print or download the PDF and take it into a discussion. The PDF therefore has to survive being read as a physical document, without a sticky table of contents.
- Sources are external URLs. They are evidence, not navigation, and they must be visibly attributable without pulling the reader out of the argument.
- Indian units and conventions throughout: Rs, lakh and crore, NSE-style number formatting, TNSVC and GCC regulatory vocabulary, Indian pricing bands.

## Capabilities and Constraints

**Confirmed capabilities.** One report, delivered as a website and as a PDF. Verdict-first structure with nine sections. Ten data tables covering city comparison, competitive segments, the price ladder, per-visit cost, break-even, wedge ranking, product architecture, statutory registrations and the risk matrix. 83 sources with inline numbered markers that resolve to the reference list.

**Confirmed constraints.**

- The content is fixed. The report has already been researched, written, audited and verified; this surface presents it, it does not author it.
- One source of truth. Both the site and the PDF are generated from the same Markdown, so an edit to the Markdown must update both. The site must never drift from the PDF.
- The PDF must carry real selectable text and real document structure, not a screenshot of a web page.
- No invented claims. Prices, counts, dates, company names and legal positions come from the report's sources. Any placeholder or illustrative material must be labelled as such.
- Static output only. No server, no API keys, no runtime dependency on a third party that could rot.
- Deep links must work. A reader who has shared one section's URL must land on that section.

**Undecided.** Whether the site is published permanently or replaced with a newer version of the report later.

## Brand Commitments

- **Name.** The report title is the product's name: a market and launch plan for mobile veterinary practice in Chennai and Coimbatore.
- **Voice.** Plain, specific, unhedged. The report already made calls, including uncomfortable ones, and the surface must not soften them into neutrality.
- **Candour over comfort.** The report states that the market floor is loss-making, that the licence regime is weakly enforced, that three compliance questions remain unresolved, and that Coimbatore's cost advantage is unverified. The surface must present those with the same weight as the recommendation, not in a footnote.
- **Indian market framing is the identity.** Rs, lakh and crore, TNSVC and GCC vocabulary, Chennai and Coimbatore localities, Indian pricing bands. Not an imported template with the currency swapped.
- **Evidence is visible.** Every number that could be challenged points at its source. The 83 references are part of the design, not an appendix to be hidden.

## Evidence on Hand

- `content/final_turn_001.md` — the verified report. 7,120 words, nine top-level sections, ten tables, 83 numbered sources, every reference cited in the body with no dangling markers. This is the single source for both outputs.
- The 83 sources are recorded in the report with full URLs and are reproduced verbatim in the reference list.

Nothing else is available. There are no logos, no photographs, no charts as images, no testimonials and no invented illustrations. Future work must not fabricate them.

## Product Principles

1. **Verdict before evidence.** The reader must learn the answer and the number that decides it within the first screen, and be able to reach the full argument by scrolling.
2. **Show the arithmetic.** Break-even, cost per visit, price floors and the second-route margin are the substance of the report. They are presented as real numbers with their inputs visible, never as a summary adjective.
3. **Cite visibly.** Sources appear as linked superscripts in the flow and resolve to a complete reference list. Provenance is part of the reading experience.
4. **Keep the reader oriented.** A persistent table of contents, a sticky position indicator and a visible current-section state, so a 7,000-word decision document never becomes a scroll.
5. **Never launder a caveat.** Unresolved compliance questions and unmeasured inputs stay attached to the claims they qualify.

## Accessibility & Inclusion

- WCAG 2.2 AA target for the site: contrast, focus visibility, semantic landmarks, real heading order and a skip link.
- Minimum 16px body text, comfortable line height and a 65 to 75 character measure for long reading.
- Full keyboard operation of navigation, table of contents and any interactive element.
- The PDF must preserve heading structure and reading order, and must remain legible in greyscale print.
- Mobile-first at 360px wide; the tables reflow rather than requiring horizontal scroll.
