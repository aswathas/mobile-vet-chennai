# Zone B brief — OMR and ECR corridor

Read `C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\BRIEF-COMMON.md` in full
first. It holds the method, the schema, the constants and the output contract. This file
holds only what is specific to Zone B.

## Zone B geography

Zone B is the OMR and ECR corridor of south Chennai. Its boundary is:

- North: Navalur and the Thazhuthendur side, up to but not including Padur and Kelambakkam.
- East: the ECR axis, from Navalur down to Thiruvanmiyur.
- South: Thiruvanmiyur. Do NOT include Neelankarai, Injambakkam or Kapilavasar.
- West: the OMR rail line side through Sholinganallur, Mappedu, Egumudi and the
  Thiruvanmiyur side.

Anchor localities that must be present: Navalur, OMR main (Kandanchal, Thazhuthendur),
Siruthai, Sholinganallur, Egumudi, Mappedu, Palavakkam, ECR Sungudi, Thiruvanmiyur.
Include the smaller named colonies, apartment clusters and IT-gated townships inside that
footprint.

Do NOT include Pallikaranai, Velachery, Chromepet, Medavakkam, Tambaram, Neelankarai,
Injambakkam or anything north of Navalur.

## Zone B character you must capture

- Highest pet density in the target area. IT-park gated townships, large apartment
  complexes, and a workforce that is young, salaried, and used to paying for services.
  Named examples to research and count: the large OMR gated townships and apartment
  clusters along the corridor, and their own resident welfare associations.
- The most direct competition. Established operators already sit here, including the
  Little Angels Navallur home-visit arm, Vetic home visits, EASZO at-home, ThePetNest,
  and the Petter and PetCare.AI marketplaces that commoditise booking on this corridor.
- Highest rents and highest affluence band in the study, so the affluence modifier on
  price is highest here.
- The road corridor itself is the constraint. OMR and ECR carry heavy all-day traffic and
  the spine report flags 2:45 to 4:15 pm as the worst congestion band on comparable
  Chennai corridors. Give realistic inter-locality travel minutes, and mark which
  localities are clusterable and which are scattered.
- Thiruvanmiyur sits at the southern end and is the natural southern anchor. Southern
  residents may belong to Zone A's gravitational pull, so check this explicitly and report
  it rather than assuming a clean split.

## Zone B specifics to model

- Zone hub: propose one and justify it on cluster geometry and travel. Candidates are
  Sholinganallur, Navalur and Thiruvanmiyur. The hub is the cold-chain base and dispatch
  point.
- Route clusters: group the 50 localities into contiguous round trips, three to eight
  localities each, that a single vehicle can serve with four or more billable services
  per trip. The ECR stretch is long and thin, so expect at least one cluster to be
  stretched, and say which.
- Seasonality: this zone has the strongest air-conditioning and covered-lobby housing
  stock in Chennai, so the summer penalty should be the mildest of the two zones. Rain
  still reduces the willingness to walk a dog out and to load an animal, so the monsoon
  penalty stands but is partly offset by indoor-visit economics.
- Affluence: highest band. Price modifier at the top of the range.

## Output

Write `localities.json`, `SOURCES.md`, `MODEL.md`, `ANALYSIS.md` into
`C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-b`.

Exactly 50 localities. Do not stop early. Do not ask questions.
