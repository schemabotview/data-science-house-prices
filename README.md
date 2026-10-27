# data-science-house-prices

**Learn data science by predicting house prices.** A GraphL concept app: one question — what is
this house worth? — answered in real, executed code, from a CSV in a Jupyter notebook to a tested
package with a command and a FastAPI service. Scenes render with `@graphlearning/graphl-flow`; the
app shell is `@graphlearning/shell`.

Scope, sections and side panes are in [`COURSE-PLAN.md`](COURSE-PLAN.md); authoring rules in
[`CLAUDE.md`](CLAUDE.md).

## Status

All 11 courses authored 2026-10-27, rendered at 4K, checked and looked at; awaiting the owner's
review. No audio yet. Where the build departed from the plan: COURSE-PLAN.md, "As authored".

| # | Course | Sections | Notebook / frame |
| --- | --- | --- | --- |
| 1 | `intro` | 2 | concept scenes |
| 2 | `setup` | 6 | IDE, then explore.ipynb |
| 3 | `select` | 7 | select.ipynb |
| 4 | `clean` | 8 | clean.ipynb |
| 5 | `shape` | 7 | shape.ipynb |
| 6 | `see` | 6 | see.ipynb |
| 7 | `measure` | 7 | stats.ipynb |
| 8 | `features` | 6 | model.ipynb |
| 9 | `model` | 8 | model.ipynb |
| 10 | `trust` | 7 | model.ipynb |
| 11 | `ship` | 7 | IDE: the house_prices package |

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
