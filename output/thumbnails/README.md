# Thumbnails

`film.png` — the thumbnail for the single full-course video (`scripts/out/film.mp4`).
A copy of `film-dark.png`. Rebuild any variant with:

```sh
npm run thumb:film -- --theme dark --source fit --out output/thumbnails/film-dark.png
```

Variants: `film-dark.png` (shipped), `film-amber.png` (brighter amber),
`film-light.png` (stands out in a dark feed), `film-value.png` and `film-batch.png`
(the other sources, below).

## The mark: the real pandas logo

The mark is the genuine pandas logo, vendored unmodified at
[`public/vendor/pandas_mark_white.svg`](../../public/vendor/pandas_mark_white.svg) (and
`pandas_mark.svg`, the navy body, for the light theme — picking the shipped variant by theme
beats recolouring, and a white mark on a near-white ground would be invisible).

This is legal here because the pandas logo is **BSD-3-Clause** — © 2008 AQR Capital Management,
LLC, Lambda Foundry, Inc. and PyData Development Team, © 2011-2026 Open source contributors —
and BSD permits redistribution provided the notice travels with it. The full notice is at
[`public/vendor/LICENSE-pandas.txt`](../../public/vendor/LICENSE-pandas.txt). The logo is used
unaltered and only to name the library the course teaches; the course's own identity is the
GraphL wordmark and badge, so nothing here claims pandas endorses it — the third BSD clause.

**The sister repos are not the same question,** and must not copy this decision:

- The **Python** logo is a PSF trademark. The PSF allows non-commercial promotion and nominative
  use, but "any other commercial uses require prior written permission" — a monetised channel is
  commercial — and asks for a ™ beside it.
- The **Apache Spark** logo is an ASF trademark, and the ASF is stricter still: a project logo may
  be used without permission essentially only as a hyperlink to the project's own site, and a
  "confusingly similar" derivative is forbidden too.

Copyright and trademark are different questions. pandas publishes its logo under a copyright
licence that says yes; the other two are marks whose owners reserve exactly the use a course
cover would make.

## The three sources, all real

`--source fit` (default, shipped) renders the figure from `spine/model/02-line/cells.json` —
§9.2, "A straight line on size". The 291 scatter points are the real test set the kernel
plotted, the line is the one `LinearRegression` really fitted, and the axes are the figure's
own. `run_notebook.py` read all of it back out of matplotlib; nothing here is drawn by hand.
The headline `£131.1 per ft²` is the slope that same step printed, alongside the intercept
£77,035 and the £32,648 typical miss. One step, one model: **the slope on the cover is the
slope of the line on the cover.**

`--source value` renders `spine/ship/04-command/session.txt`: the real `house-prices value`
command, £383,000 (likely £350k–£417k), and the two commands the model **refuses** —
Harbourside, never seen, and 12,000 ft², far outside the 525–3,833 it knows.

`--source batch` renders `spine/ship/05-batch/session.txt`: 20 houses valued in one command,
with the first five rows of the real `valued.csv` as bars.

A source is never mixed with another. The £383,000 comes from the full shipped pipeline, not
from the one-feature line in §9.2 — putting that number above this plot would advertise a fit
that did not produce it, which is the failure mode this script exists to avoid.

## Why not `npm run thumb` (the shell's `graphl-thumb`)

That template is a **per-course** poster: 58% of a scene plus a text panel. A scene is a 16:9
video frame, and cropped to 58% it turns to unreadable mush at the ~168px wide the YouTube
mobile feed actually renders — the only size that decides a thumbnail.
`scripts/thumb-film.mjs` uses poster grammar instead: few elements, enormous type, one focal
object. Every change was checked by downscaling to 168px, not at 1280px. At that size what
survives is LEARN / DATA / SCIENCE, the badge, `£131.1`, and the scatter-with-a-line as a
shape — which is the whole pitch of the course in one glance.

## Guards

Everything on the card is parsed out of the spine — a `session.txt` or a step's `cells.json`,
the same replayed output the scenes use — and a line that does not parse is a hard error, so
no invented figure can reach the thumbnail. The renderer also asserts that no element
overflows its box, and long code and command lines are **shrunk to fit, never truncated**. The
headline splits on spaces into one line per word and shrinks against the left column's max
width, so a longer concept name cannot push the card off the canvas.
