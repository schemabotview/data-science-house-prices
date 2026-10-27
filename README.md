# data-science-house-prices

**Learn data science by predicting house prices.** A GraphL concept app: one question — what is
this house worth? — answered in real, executed code, from a CSV in a Jupyter notebook to a tested
package with a command and a FastAPI service. Scenes render with `@graphlearning/graphl-flow`; the
app shell is `@graphlearning/shell`.

Scope, sections and side panes are in [`COURSE-PLAN.md`](COURSE-PLAN.md); authoring rules in
[`CLAUDE.md`](CLAUDE.md).

## Status

| # | Course | Sections | Status |
| --- | --- | --- | --- |
| 2 | `setup` | 6 | authored, awaiting review; no audio |

## Run it

```sh
npm install          # until graphl-flow 0.4.0 is on npm, see CLAUDE.md
npm run dev          # http://localhost:5173  ·  routes are #/<course>-<section>
```

## Verify a change

```sh
scripts/install-python.sh                             # once: CPython 3.15.1 in /usr/local
npm run build && npx tsc --noEmit && npm run check    # content + 4K render
npm run check:spine && npm run check:data             # replays every step; the data's seed
npm run shots -- <course>                             # 4K PNGs in out/shots/, then look
```

## Layout

```
data/                    the generated Millbrook data (scripts/generate_data.py)
src/content/<course>/    one file per section + the course index
src/scenes/<course>/     declarative scenes (never x/y)
src/scenes/notebook.ts   the notebook frame; ide.ts the IDE frame; lab.ts lab output
spine/<course>/<step>/   the project as real files, one cumulative snapshot per step
scripts/                 spine.py, run_notebook.py, nb.py, generate_data.py, checks, shots
```
