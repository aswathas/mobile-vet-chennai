# Zone A brief — South-East Chennai cluster

Read `C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\BRIEF-COMMON.md` in full
first. It holds the method, the schema, the constants and the output contract. This file
holds only what is specific to Zone A.

## Zone A geography

Zone A is the south-east Chennai cluster. Its boundary is:

- North: Tambaram and the northern edge of the Ponnery/Hasthinapuram belt.
- East: Pallikaranai and the Chembedu side of the Velachery lake road.
- South: Velachery and the Guindy side of the Velachery main road.
- West: Chromepet, Medavakkam and the Nanganallur side.

Anchor localities that must be present: Tambaram, Mangadu, Nanganallur, Medavakkam,
Chromepet, Hasthinapuram, Pallikaranai, Velachery. Include the smaller named colonies,
apartment clusters and street clusters inside that footprint.

Do NOT include Neelankarai, Injambakkam, Thiruvanmiyur, Palavakkam or anything north of
Tambaram. Those belong to Zone B or are out of scope.

## Zone A character you must capture

- The new airport corridor (Parandur) pulls in a working population with pets, but the
  corridor road is uncongested and the housing is newer with smaller apartment blocks.
- Medavakkam and Chromepet carry older individual houses mixed with newer blocks, so
  clustering is weaker and travel per visit is higher than in Velachery.
- Pallikaranai and Velachery carry the heaviest apartment concentration, the strongest
  apartment-association structure, and the most existing veterinary competition,
  including Little Angels at Navallur and Blue Cross at Velachery.
- The GCC free service points nearest this zone are at Tiruvottiyur, Thiru Vi Ka Nagar,
  Pulianthope, Nungambakkam, Kannammapet and Meenambakkam. Note the distance from each to
  the localities they most serve, because the licence-compliance wedge is strongest where
  the free centre is far.
- Existing house-call operators in and near this zone: Dr P. Ramadass at Medavakkam,
  Vet At Home at Perungalathur, and the wider set of independent house-call vets.

## Zone A specifics to model

- Zone hub: propose one and justify it on cluster geometry and travel. Candidates are
  Medavakkam, Chembedu and Velachery. The hub is the cold-chain base and dispatch point.
- Route clusters: group the 50 localities into contiguous round trips, three to eight
  localities each, that a single vehicle can serve with four or more billable services
  per trip.
- Seasonality: this zone carries the worst of Chennai's heat because of the open layout
  and wider roads, so the summer penalty should be at the steeper end for the outer
  localities and milder for the dense apartment clusters with covered parking.
- Affluence: Velachery and Pallikaranai skew higher than Tambaram, Medavakkam and Mangadu.
  This drives the affluence modifier on price.

## Output

Write `localities.json`, `SOURCES.md`, `MODEL.md`, `ANALYSIS.md` into
`C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-a`.

Exactly 50 localities. Do not stop early. Do not ask questions.
