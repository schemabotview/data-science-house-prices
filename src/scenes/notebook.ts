import type { Code, Edge, Group, Plot, PlotSeries, SceneModel, SceneNode, Table, TreeEntry } from '@graphlearning/graphl-flow'
import { FRAME_H, NB_W, SIDE_W } from './grid'

// The NOTEBOOK frame v2, Courses 2–10, on graphl-flow 0.10's shared grid (grid.ts): the SAME 1344 × 756
// box and fit as the IDE frame, so cutting between them never zooms (check-render asserts one fit):
//
//   notebook (NB_W × FRAME_H) | side pane (SIDE_W, fixed, `spread`)
//
// No explorer: on the grid's 715px work column a notebook holds ~61 characters and pandas' wide
// DataFrames do not fit, so the notebook takes the explorer's column too. Its tab names the file.
//
// A cell is graphl-flow's notebook cell (a group with `cell: n`): the `[n]` gutter, the input, its
// outputs. Everything a cell shows comes from the step's cells.json, written by a real kernel
// (scripts/spine.py): the count, the source, stdout, a DataFrame's HTML table parsed into rows, a
// traceback. Nothing here is typed.
//
// A notebook grows down; a frame does not. `show` picks the cells a section is about, and the cells
// above fold into one `··· N cells above` line, as a scrolled notebook hides them. check-render
// fails a frame whose cells run past the pane (a floor would let them grow it and move the template).
//
// The side pane is STRICT (linux-admin's console frame): at most two parts, and with two, one is a
// diagram (a group or a plot) and the other at most one table. check-content counts it.

export const NOTEBOOK_W = NB_W
export const NB_SIDE_W = SIDE_W
/** A compact figure in a cell, as wide as the cell's output column (the notebook less the gutter and paddings). */
export const NB_PLOT_W = NB_W - 150
/** Characters an input line holds (15px Plex Mono, 9.0px advance) once the gutter and padding (166px,
 *  measured on the v1 940px notebook, which held 86) are paid. */
export const NB_COLS = Math.floor((NB_W - 166) / 9)

export interface CellOutput {
  type: 'stream' | 'result' | 'error'
  text?: string
  name?: string
  table?: { columns: string[]; index_name: string; rows: string[][] }
  image?: boolean
  ename?: string
  evalue?: string
  traceback?: string
}
/** One matplotlib Axes as the kernel drew it (scripts/run_notebook.py, READ_FIGURES). */
export interface Figure {
  title: string
  xlabel: string
  ylabel: string
  xlim: number[]
  ylim: number[]
  /** [x, width, y, height] per bar. */
  bars: number[][]
  lines: { x: number[]; y: number[]; label: string; color?: string }[]
  /** Scatter collections: [x, y] points each. */
  points: number[][][]
  /** Line collections (vlines, hlines): segments of [x, y] points each. */
  segments?: number[][][][]
  xticklabels: string[]
}
export interface Cell {
  cell: number
  figure?: Figure[]
  n?: number | null
  source?: string
  markdown?: string
  outputs?: CellOutput[]
}

export interface CellView {
  /** Draw the cell's figure at the compact size (420×280) instead of the full one. */
  compact?: boolean
  /** Divide the figure's x / y values (and limits) by this — e.g. 1000 to read prices in £k. */
  xScale?: number
  yScale?: number
  /** Input lines (1-based) to tint. */
  highlight?: number[]
  /** Input line ranges to keep; each skipped run folds to one `··· N lines` row (frame v2's height). */
  show?: [number, number][]
  /** A long text output keeps its first `head` and last `tail` lines around a `··· N lines` row. */
  head?: number
  tail?: number
  /** Show only these DataFrame rows (by position) — the rest fold into one row. */
  rows?: number
}

export interface NotebookFrame {
  project?: string
  /** v1's explorer entries: kept so a scene still names its project's files; v2 draws no explorer. */
  tree?: TreeEntry[]
  /** The notebook's tab: its path under the project. */
  file: string
  /** The step's cells.json. */
  cells: Cell[]
  /** Cell numbers to show (default all). Cells above the first fold into one line. */
  show?: number[]
  view?: Record<number, CellView>
  side: SceneNode[]
  edges?: Edge[]
}

export const NB_IDS = { notebook: 'notebook', side: 'side' } as const

const trimEnd = (t: string) => t.replace(/\n+$/, '')

/** A line longer than the notebook is wide WRAPS, as Jupyter's output area wraps it. */
export const wrap = (text: string, prefix = '') => text.split('\n').flatMap((line) => {
  const rows: string[] = []
  let rest = line
  while (rest.length > NB_COLS) {
    // Break at the last space that fits, as a browser would; a run with no space breaks hard.
    const at = rest.lastIndexOf(' ', NB_COLS)
    const cut = at > NB_COLS / 2 ? at : NB_COLS
    rows.push(rest.slice(0, cut))
    rest = rest.slice(cut).replace(/^ /, '')
  }
  return [...rows, rest].map((r) => prefix + r)
}).join('\n')

/** Keep `head` lines and `tail` lines of a text; the run between becomes one fold row. */
export function clip(text: string, head?: number, tail = 0): string {
  const lines = wrap(trimEnd(text)).split('\n')
  if (head === undefined || lines.length <= head + tail + 1) return lines.join('\n')
  return [...lines.slice(0, head), `··· ${lines.length - head - tail} lines`, ...lines.slice(lines.length - tail)].join('\n')
}

/**
 * An IPython traceback as a notebook shows it, abridged to what a learner reads: the cell and line it
 * started in (`Cell In[5], line 1` and its arrowed source line), a fold for the library frames, and
 * the exception line. Each kept line is the kernel's own text.
 */
export function errorLines(o: CellOutput): string {
  const lines = trimEnd(o.traceback ?? '').split('\n').filter((l) => !/^-+$/.test(l))
  const start = lines.findIndex((l) => l.startsWith('Cell In['))
  const arrow = lines.findIndex((l, i) => i > start && l.startsWith('---->'))
  const keep = start >= 0 ? [lines[start], ...(arrow > 0 ? [lines[arrow]] : [])] : []
  const last = lines.findLastIndex((l) => l.startsWith(`${o.ename}:`) || l.startsWith(`${o.ename} `))
  const tailLine = last >= 0 ? lines[last] : `${o.ename}: ${o.evalue}`
  const hidden = Math.max(0, (last >= 0 ? last : lines.length) - (arrow > 0 ? arrow : start) - 1)
  return wrap([...keep, ...(hidden ? [`··· ${hidden} lines in the libraries`] : []), tailLine].join('\n'), '! ')
}

function dataframe(id: string, t: NonNullable<CellOutput['table']>, rows?: number): Table {
  const body = rows !== undefined && t.rows.length > rows + 1
    ? [...t.rows.slice(0, rows), { id: `${id}-more`, cells: [`··· ${t.rows.length - rows} more rows`] }]
    : t.rows
  return { type: 'table', id, columns: [t.index_name, ...t.columns], rows: body }
}

/**
 * A figure, redrawn as a graphl-flow plot from the data matplotlib plotted: bars (categorical when
 * each has a tick label, else at their centres), lines, scatter points, the axes' limits and labels.
 * Nothing is re-derived: the numbers are the kernel's.
 */
export function figurePlot(id: string, f: Figure, opts: { compact?: boolean; w?: number; xScale?: number; yScale?: number; tone?: Plot['tone'] } = {}): Plot {
  const sx = opts.xScale ?? 1, sy = opts.yScale ?? 1
  const r = (v: number, s: number) => Math.round((v / s) * 1000) / 1000
  const labels = f.xticklabels.filter((t) => t)
  const categorical = f.bars.length > 0 && labels.length === f.bars.length && labels.some((t) => /[A-Za-z]/.test(t))
  const series: PlotSeries[] = []
  if (f.bars.length) series.push({ kind: 'bar', label: f.ylabel || undefined, points: f.bars.map((b, i) => [categorical ? i : r(b[0] + b[1] / 2, sx), r(b[2] + b[3], sy)] as [number, number]) })
  // matplotlib's red is a marker the cell drew on purpose: the warning tone. Black is construction.
  const toneOf = (c?: string): PlotSeries['tone'] => (c === '#ff0000' ? 'consume' : c === '#000000' ? 'neutral' : undefined)
  for (const l of f.lines) if (l.x.length > 1) series.push({ kind: 'line', tone: toneOf(l.color), label: l.label.startsWith('_') ? undefined : l.label, points: l.x.map((x, i) => [r(x, sx), r(l.y[i], sy)] as [number, number]) })
  for (const pts of f.points) series.push({ kind: 'scatter', points: pts.map(([x, y]) => [r(x, sx), r(y, sy)] as [number, number]) })
  for (const segs of f.segments ?? []) for (const [[x0, y0], [x1, y1]] of segs)
    series.push({ kind: 'segment', from: [r(x0, categorical ? 1 : sx), r(y0, sy)], to: [r(x1, categorical ? 1 : sx), r(y1, sy)], dashed: false, tone: 'neutral' })
  // Scaled axes here are prices: £k.
  const unit = (label: string, s: number) => (s === 1000 ? (label ? `${label} (£k)` : '£k') : label) || undefined
  return {
    type: 'plot', id, title: f.title || undefined, compact: opts.compact, w: opts.w, tone: opts.tone,
    x: categorical ? { labels, label: f.xlabel || undefined } : { min: r(f.xlim[0], sx), max: r(f.xlim[1], sx), label: unit(f.xlabel, sx) },
    y: { min: r(f.ylim[0], sy), max: r(f.ylim[1], sy), label: unit(f.ylabel, sy) },
    series,
  }
}

function cellNode(c: Cell, view: CellView = {}): Group {
  const id = `c${c.cell}`
  // `wrap`: a line past the notebook's width soft-wraps, as JupyterLab's editor wraps it.
  const input: Code = { type: 'code', id, lang: 'python', code: trimEnd(c.source ?? ''), highlight: view.highlight, show: view.show, wrap: true }
  const outs: SceneNode[] = []
  let text: string[] = []
  // Consecutive text outputs (a print, then a repr) read as one block, as Jupyter stacks them.
  const flush = () => {
    if (text.length) outs.push({ type: 'code', id: `${id}-out${outs.length || ''}`, output: true, code: clip(text.join('\n'), view.head, view.tail) })
    text = []
  }
  for (const o of c.outputs ?? []) {
    if (o.type === 'result' && o.table) {
      flush()
      outs.push(dataframe(`${id}-df${outs.length || ''}`, o.table, view.rows))
    } else if (o.type === 'error') {
      flush()
      outs.push({ type: 'code', id: `${id}-err`, output: true, code: errorLines(o) })
    } else if (o.type === 'result' && o.image && c.figure?.length) {
      // A figure: redrawn from the data matplotlib plotted, where Jupyter shows the picture.
      flush()
      // compact is the frame-v2 height; `w` gives it the notebook's width, so category labels have room
      c.figure.forEach((f, i) => outs.push(figurePlot(`${id}-fig${i || ''}`, f, view.compact ? { ...view, w: NB_PLOT_W } : view)))
    } else text.push(trimEnd(o.text ?? ''))
  }
  flush()
  return { type: 'group', id: `cell${c.cell}`, cell: c.n ?? true, children: [input, ...outs] }
}

export function notebookFrame({ file, cells, show, view = {}, side, edges = [] }: NotebookFrame): SceneModel {
  const code = cells.filter((c) => c.markdown === undefined)
  const shown = show ? code.filter((c) => show.includes(c.cell)) : code
  for (const n of show ?? []) if (!code.some((c) => c.cell === n)) throw new Error(`notebook.ts: ${file} has no code cell ${n}`)
  const above = code.filter((c) => c.cell < (shown[0]?.cell ?? 0)).length
  const fold: SceneNode[] = above ? [{ type: 'code', id: 'above', output: true, code: `··· ${above} cell${above === 1 ? '' : 's'} above` }] : []
  const notebook: Group = {
    type: 'group', id: NB_IDS.notebook, title: `${file.split('/').at(-1)}  ·  kernel .venv, Python 3.15.1`, icon: 'jupyter', tone: 'ingest',
    w: NOTEBOOK_W, h: FRAME_H, children: [...fold, ...shown.map((c) => cellNode(c, view[c.cell]))],
  }
  // `spread`: the side pane's blocks share the frame's full height, evenly, instead of stacking at
  // the top of an empty column.
  const pane: Group = { type: 'group', id: NB_IDS.side, bare: true, spread: true, w: NB_SIDE_W, h: FRAME_H, children: side }
  return { dir: 'row', padding: 0.01, nodes: [notebook, pane], edges }
}

/** A cell's first output of a type, for side panes that quote a value the kernel printed. */
export function outputOf(cells: Cell[], cell: number, type: CellOutput['type'] = 'result'): CellOutput {
  const o = cells.find((c) => c.cell === cell)?.outputs?.find((x) => x.type === type)
  if (!o) throw new Error(`notebook.ts: cell ${cell} has no ${type} output`)
  return o
}

/** A cell's output text, trimmed. */
export const textOf = (cells: Cell[], cell: number, type: CellOutput['type'] = 'result') => trimEnd(outputOf(cells, cell, type).text ?? '')

/**
 * A printed Series (value_counts, a groupby result) as [label, value] pairs: one row per line that
 * holds a label and a value separated by 2+ spaces; the index-name header, `Name:` and `dtype:` lines
 * are skipped. The text is the kernel's; this only splits it.
 */
export function seriesOf(text: string): [string, string][] {
  return trimEnd(text).split('\n')
    .filter((l) => !/^(Name|dtype|Freq):/.test(l))
    .map((l) => /^(.*?\S)\s{2,}(\S.*)$/.exec(l))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => [m[1].trim(), m[2].trim()])
}

/** A number from the kernel's text: `np.int64(246)` → 246, `84513` → 84513. */
export const num = (text: string) => Number(/-?[\d.]+(?:e[-+]?\d+)?/.exec(text.replace(/np\.\w+\(/, ''))![0])
