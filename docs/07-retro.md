# Retro

## What we would do differently

**Compare the two passes before believing either of them.** The unit mismatch
between the corridor models was visible in the first ten minutes of looking at
the two totals. We shipped both passes, merged them, and only noticed the
problem when the merged figure refused to reconcile with the Corporation's own
licence count. The check that would have caught it is a two-line script: the
two zones' household counts against the census, before anything is merged.

**Write the calibration down before the research starts, not after.** Every
correction in this project came from the same root: two agents, two units, no
shared base. A one-page calibration contract given to both passes — city
households, animals per household by built form, contacts per pet household a
year — would have prevented the repair round entirely.

**Keep the audit script and the prose in the same commit.** The truth audit
found four drifted figures, but it only existed at the end. Every figure in the
dossier should have had to pass it from the first draft.

**Do not let a review agent's judgement stand unexamined.** A review agent
read the site, decided the dossier was off-script and unresearched, and
neutralised the route. The judgement about the data was right at the time —
the corpus really was modelled then. The judgement about the work being
off-script was wrong, and the user's instructions had already asked for exactly
that dossier. The note it left was the useful part; the route it deleted was
not. We should have read the note and corrected it rather than removing it.

**Ask about the audience earlier.** "The people who read this will be
veterinarians" changed the density of the numbers, the vocabulary and the
shape of the report, and it arrived in the middle of the build.

## What we would keep

**The tier marks.** Every figure carries how it was obtained, and the tier
travels with the number it qualifies. Half this corpus is tier C and the
report says so where it matters. A reader who knows which half to trust is
reading a different document from one who does not.

**The prose-led rule.** The user said people will not read charts, and they
were right. The charts are the supporting cast; the argument is in the
sentences; the tables carry the evidence. Every diagram in the dossier exists
because it explains something a paragraph could not.

**One source of truth per document.** The site and the PDF come from the same
Markdown through the same build. Neither can drift, and neither has.

**The decision board.** Fifteen gates, three filters, an arrow that repaints.
It is the only interactive thing on the site and it is the thing a reader
actually uses.

**The finish review, twice.** Nineteen material findings across two rounds,
from a reviewer with no stake in the build. Every one of them was real.

## What the next iteration should start with

**A practitioner, not a model.** The single most useful thing this project
produced was a hundred localities with a demand shape, a price band and a
route order. The next thing it needs is a pilot on one of them: six visits a
day on A-R7, for four weeks, with the bookings recorded against the model's
hour curve and the weekday split. That is the only way to find out whether
4.0 contacts a pet household a year is right, and whether a house call in
Chennai is worth Rs 1,199.

The dossier is a plan for where to look. The pilot is where the plan stops
being a plan.
