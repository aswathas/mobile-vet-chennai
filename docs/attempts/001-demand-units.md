# Attempt 001 — Two passes, two units

**Hypothesis.** Two research passes, one per corridor, each with the same
written schema, would produce a comparable hundred-locality corpus that two
model notes could be reconciled against.

**How we tested it.** Both passes ran in parallel against
`research/BRIEF-COMMON.md`, with the same schema, the same tier discipline and
the same instruction to model veterinary demand from primary sources. Each
returned fifty localities with a full metric set.

**What actually happened.** The schemas matched. The units did not.

Zone A measured veterinary demand per household a year: 2.80 to 3.10 visits
per household per year, applied to a household base built from a modelled
built-footprint density.

Zone B measured veterinary demand per pet-owning household a year, applied to a
household base allocated from the Census 2011 enumeration blocks and the
Corporation's property-tax ledger.

Set side by side, Zone B produced 32,172 cases a month against Zone A's
5,378 — a ratio of six to one that said the OMR corridor was six times
bigger than the south-east cluster. It was not. Zone B's household model was
also three orders of magnitude out, at 5,567 households for a corridor that
holds hundreds of thousands, because it computed households from street-token
counts and never used the ward totals it had already calculated.

The tell was arithmetic: the merged pet base did not reconcile with the
Corporation's own 68,736 active licences, and it did not reconcile with the
1,50,303 dogs the Corporation vaccinated in the 2026 campaign.

**Outcome.** Abandoned as a comparison. Kept as two sources of truth, which is
what they were always good for.

**Why we moved on.** A demand model with two units is not a comparison, it is
an arithmetic coincidence with a story attached. Both passes were put onto one
city-level calibration — the Corporation's own figures for dogs, the Census and
the property-tax ledger for households, and 4.0 contacts per pet-owning
household a year — and the three corrections are written into the report
rather than into a script.
