# CLAUDE.md — data-science-house-prices

> Workspace invariants live in the workspace `CLAUDE.md`. This file is only what is true here.

## What this repo is

A GraphL concept app: **learn data science by predicting house prices**. One question — what is this
house worth? — and one project, `house-prices`, from a CSV in a notebook to a tested package with a
command and a FastAPI service. A **section** is `(scene, narration)`: one full-screen 16:9 frame, one
chapter of the video.

**`COURSE-PLAN.md` is the source of truth**: courses, sections, side panes, the data and its planted
faults. Change it first; never drift from it.

Engine `@graphlearning/graphl-flow` ^0.4.0 (the notebook cell, `group.cell` / `code.output`), shell
`@graphlearning/shell` ^1.0.1 with `overrides` letting it take engine 0.4. Sister repo:
**python-expense-tracker** (same infra: spine, checks, IDE frame). Port from it; do not reinvent.

**Engine 0.4.0 is not on npm yet.** There is no package-lock.json until it is: install the packed
tarball locally (`npm pack` in graphl-flow, then `npm install <tgz>` here and restore package.json),
never commit a `file:` dependency. When 0.4.0 is published: `npm install`, commit the lock, delete
this paragraph.

## Status

See the table in README.md. Courses are authored in order and registered in `src/content/index.ts`
only when authored.

## Route contract

`#/` catalog; `#/<courseId>-<sectionId>` a section; `?capture=1` and `window.__scene.plan()` come
from the shell. Do not reimplement the shell.

## Python 3.15.1, every output run

Pinned to CPython 3.15.1 (`scripts/install-python.sh`, the expense tracker's). Every library pin is in
the spine's `pyproject.toml` `[dependency-groups] notebook`; pandas 3.1.0, NumPy 2.5.4, matplotlib
3.11.2, JupyterLab 4.6.4 from Course 2, SciPy and scikit-learn added when a course needs them, pytest
and FastAPI in Course 11. All had cp315 wheels on 2026-10-27 (PyYAML builds from source, quietly).

## The data

`scripts/generate_data.py` writes `data/` — standard library `random`, seeded, byte-identical on every
run (`npm run check:data`). It holds the HIDDEN PRICING RULE (Course 9.4 reveals it; nothing before
may quote it) and the planted faults, each one a lesson. `built` is deliberately NOT in the rule: it
is Course 7.7's confounder. A spine step's `data/*.csv` must equal `data/` byte for byte (spine.py
checks). areas.csv enters the project in Course 5, listings.csv in Course 11.

## The spine

`spine/<course>/<NN-step>/` = `project/` + `step.json` + `session.txt` (a terminal) and/or
`cells.json` (a notebook, run by a real kernel). Exactly one of `first`, `from` + `changes`, or `lab`.
Notebooks are stored CLEAN (`scripts/nb.py text|write`): no outputs, ids c1, c2 …, so a step's diff
is its cells. `"sequence"` runs cells in a learner's order, `[n, "source"]` an older text of a cell
(2.5's stale result is real). The kernel venv is cached per pyproject.toml in
`~/.cache/house-prices-spine/`. Random things (splits, bootstrap, models) are SEEDED, so they replay;
timings are `volatile`: a scene reads them from the cells, narration says "hundreds of times", never a
number.
`scripts/step.py` makes the next notebook step (copy the parent, append cells, write step.json);
`"produces"` keeps a file a notebook writes (homes_clean.csv) in the project, checked against the run.
**Figures**: after a cell draws, `run_notebook.py` reads the figure's DATA back from matplotlib (bars,
lines through their own transforms, scatter points, line collections, limits, colours) with hidden
kernel calls that move no counts; `figurePlot` (notebook.ts) redraws it as a graphl-flow plot.
Course 11's steps are terminal sessions (pip, pytest, the command, uvicorn + curl, stopped by pkill).

## Frames

- **Notebook frame** (`src/scenes/notebook.ts`), Courses 2–10: explorer (240) | notebook (940) |
  side pane (536, `spread`). Cells come from cells.json: `show` picks cells (the rest fold to
  `··· N cells above`), `view` tints lines and clips long text / DataFrame rows. A DataFrame output
  is a `table` parsed from pandas' own HTML.
- **IDE frame** (`src/scenes/ide.ts`, the expense tracker's): 2.1 and Course 11.
- Both side panes `spread` their blocks over the full height; check-render's fill rule is the blocks'
  own height ≥ 50% of the pane (add real content, never padding).
- Both are 1736 wide at 16:9: check-render asserts every framed section is on ONE fit, and each pane
  at the same pixels as the first frame of its kind, and that no pane's content runs past it, and
  that no plot text overlaps other plot text (six category labels once ran into one word).
- **Concept scenes** (◆ full scene) carry real lab output (`src/scenes/lab.ts` `outputOf`).
- Every side pane is a DIAGRAM (edge, table or plot — check-content). No edges between panes.
- Values in a scene are READ from the spine (`textOf`, `outputOf`, regex over a session), never typed.

## Checks, before handing over

```sh
npm run build && npx tsc --noEmit && npm run check   # check-content + check-render (4K)
npm run check:spine                                  # replays every step on 3.15.1 (slow: kernels)
npm run check:data
npm run shots -- <course>                            # then LOOK
```

Checks are a floor, not proof.

## Invariants

- Never write `x`/`y`; scenes are declarative.
- Stylesheets in order: graphl-flow, shell, `./theme.css` last.
- No `file:` installs committed.
- Narration: `.tts` → `.wav` via Colab + Chatterbox only. Audio at `public/audio/<course>/<id>.wav`.
- `SiteHeader` on the catalog page only.
