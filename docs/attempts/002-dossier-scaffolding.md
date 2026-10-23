# Attempt 002 — Building the dossier before the research

**Hypothesis.** The dossier's structure — a route, a build script, a table
generator, a page and a PDF — could be built against placeholder data while the
research ran, and the real data dropped in at the end.

**How we tested it.** A fixture generator produced three localities per zone
with plausible numbers, and the whole pipeline was built and screenshotted
against it: the build script, the generated tables and charts, the page, the
print route, the PDF.

**What actually happened.** It worked, which is the problem. The site rendered
a complete-looking dossier with numbers nobody had researched, and the
figures looked plausible enough that nobody questioned them. A review agent
reading the finished site caught it and neutralised the route, with a note
explaining exactly why: the corpus was modelled, not researched, and publishing
it would put unsourced commercial claims in front of investors and partners.

The note was right about the data and wrong about the work. The dossier was not
off-script; the user's instructions had asked for a hundred localities with
hour-wise, week-wise and monthly analysis, and had asked for the site to carry
it. What was off-script was the data.

**Outcome.** Abandoned as a publishing path. The scaffolding was kept, and the
research was finished properly instead.

**Why we moved on.** A fixture that renders like the real thing is worse than
no fixture at all, because it hides the difference between a placeholder and a
finding. The fixture was demoted to a test input behind an environment
variable, and the real corpus replaced it at the route.

The review agent's note stayed in the repository until the corpus
was real, at which point it was replaced by `docs/DOSSIER-STATUS.md`, which
says what the dossier is now and where its evidence lives.
