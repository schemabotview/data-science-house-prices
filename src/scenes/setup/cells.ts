import type { SceneModel } from '@graphlearning/graphl-flow'
import { notebookFrame, outputOf, textOf, type Cell } from '../notebook'
import { tree } from '../tree'
import first from '../../../spine/setup/03-first-cells/cells.json'
import anatomy from '../../../spine/setup/04-dataframe/cells.json'
import stale from '../../../spine/setup/05-stale/cells.json'
import numpy from '../../../spine/setup/06-numpy/cells.json'
import staleStep from '../../../spine/setup/05-stale/step.json'
import csv from '../../../spine/setup/01-venv/project/data/homes.csv?raw'

const FILE = 'notebooks/explore.ipynb'
// The side pane is narrower than a CSV line: each line is cut after its fifth field, with an
// explicit ellipsis, never reworded.
const csvLines = csv.split('\n').map((l) => l.split(',').slice(0, 5).join(',') + ',…')
const head = outputOf(first as Cell[], 2).table!

// §2.3 — first cells: read_csv, shape, head(). The side pane is the CSV's real first lines and the
// same rows as pandas printed them: a line becomes a row, the header becomes column names, and pandas
// adds the index.
export const setupFirstCells: SceneModel = notebookFrame({
  tree: tree({ active: FILE, fresh: [FILE] }), file: FILE, cells: first as Cell[],
  side: [
    { type: 'code', id: 'csv', filename: 'data/homes.csv — the first 4 of 1,461 lines', lang: 'text', code: csvLines.slice(0, 4).join('\n'), highlight: [1] },
    {
      type: 'table', id: 'frame', title: 'homes — the same lines, as a DataFrame', tone: 'store',
      columns: ['index', ...head.columns.slice(0, 4), '…'], rows: head.rows.slice(0, 3).map((r) => ({ id: `r${r[0]}`, cells: [...r.slice(0, 5), '…'] })),
    },
    {
      type: 'table', id: 'shape', title: `homes.shape = ${textOf(first as Cell[], 1)}`, tone: 'ingest', columns: ['the file', 'the DataFrame'], rows: [
        ['the header line', 'the column names'],
        ['each other line', 'one row'],
        ['(no row numbers)', 'an index: 0, 1, 2, …'],
      ],
    },
    { type: 'note', id: 'first-note', tone: 'consume', text: 'Already visible in five rows: a date written day-first, NaN for a missing garage, a year printed as 1961.0.' },
  ],
  edges: [{ from: 'csv', to: 'frame', label: 'pd.read_csv' }],
})

// §2.4 — ◆ side pane: anatomy of a DataFrame. info() is the kernel's own; the side pane draws the
// same object as an index plus columns, each column a Series with ONE dtype. price is `str`: one
// export wrote "£215,000", so pandas read the whole column as text (Course 4 fixes it).
const info = textOf(anatomy as Cell[], 3, 'stream')
const dtypeOf = (col: string) => new RegExp(`^\\s*\\d+\\s+${col}\\s+\\d+ non-null\\s+(\\S+)`, 'm').exec(info)![1]
const series = (col: string) => ({
  type: 'table' as const, id: `s-${col}`, title: `${col} · ${dtypeOf(col)}`, tone: (dtypeOf(col) === 'str' ? 'consume' : 'store') as 'consume' | 'store',
  rows: [...head.rows.slice(0, 3).map((r) => [r[head.columns.indexOf(col) + 1]]), ['…']],
})
export const setupDataframe: SceneModel = notebookFrame({
  tree: tree({ active: FILE }), file: FILE, cells: anatomy as Cell[], show: [3, 4],
  side: [
    {
      type: 'group', id: 'anatomy', title: 'homes: one index, ten Series', icon: 'table', tone: 'ingest', dir: 'row', children: [
        { type: 'table', id: 'index', title: 'index', rows: [['0'], ['1'], ['2'], ['…']] },
        series('sqft'),
        series('area'),
        series('price'),
      ],
    },
    {
      type: 'table', id: 'dtypes', title: 'dtypes, from info()', tone: 'ingest', columns: ['dtype', 'columns'], rows: [
        ['int64', 'id, sqft, beds, condition'],
        ['float64', 'built, garage (NaN gaps)'],
        { cells: ['str', 'sold, agent, area, price'], tone: 'consume' },
      ],
    },
    {
      type: 'group', id: 'select', title: 'prices = homes["price"]', icon: 'filter', tone: 'consume', dir: 'row', children: [
        { type: 'item', id: 'sel-what', title: 'one column out', sub: textOf(anatomy as Cell[], 4).split(', <')[0].replace('(', '') + ': values + the same index', icon: 'table' },
        { type: 'item', id: 'sel-dtype', title: 'dtype: str', sub: 'text, so no sum, no mean', icon: 'key' },
      ],
    },
    { type: 'note', id: 'price-note', tone: 'consume', text: 'price is text: one agent wrote "£215,000". One bad value makes a whole column a string.' },
  ],
})

// §2.5 — execution order. Cell 5 RAN with `> 2000`, was then edited to `> 2500` and never re-run;
// cell 6 ran twice. The counts [5] and [7] and the stale 154 are the kernel's, made for real by the
// step's `sequence`. The fresh answer (Restart & Run All) is §2.6's first run of the same cells.
const staleLen = textOf(stale as Cell[], 6)
// The text cell 5 ran with, from the step's sequence ([5, "source"]): what the kernel saw.
const ranWith = (staleStep.sequence.find((e) => Array.isArray(e) && e[0] === 5) as [number, string])[1]
const freshLen = textOf(numpy as Cell[], 6)
export const setupStale: SceneModel = notebookFrame({
  tree: tree({ active: FILE }), file: FILE, cells: stale as Cell[], show: [4, 5, 6], view: { 5: { highlight: [1] } },
  side: [
    {
      type: 'group', id: 'history', title: 'What the kernel actually ran', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'h5', title: `[5]  ${ranWith}`, sub: 'the text BEFORE the edit', icon: 'code' },
        { type: 'item', id: 'h6', title: `[6]  len(big)  →  ${staleLen}`, icon: 'code' },
        { type: 'item', id: 'hedit', title: `edited: ${(stale as Cell[]).find((c) => c.cell === 5)!.source}`, sub: 'not run: the kernel never saw it', icon: 'file' },
        { type: 'item', id: 'h7', title: `[7]  len(big)  →  ${staleLen}`, sub: 'still the old big', icon: 'code' },
      ],
    },
    {
      type: 'table', id: 'answers', title: 'len(big) for homes over 2,500 sq ft', tone: 'consume', columns: ['run', 'answer'], rows: [
        { cells: ['as run: [5], then [6], [7]', staleLen], tone: 'consume' },
        { cells: ['Restart & Run All', freshLen], tone: 'store' },
      ],
    },
    { type: 'note', id: 'rule', tone: 'store', text: 'Before you trust or share a notebook: Kernel → Restart Kernel and Run All Cells. The counts should read 1, 2, 3 …' },
  ],
  edges: [{ from: 'h5', to: 'h6' }, { from: 'h6', to: 'hedit' }, { from: 'hedit', to: 'h7' }],
})

// §2.6 — NumPy underneath. A column is a NumPy array: one dtype, packed — 1,460 × 8 bytes. The two
// %timeit lines are VOLATILE (they change every run): the side pane reads them from the cells, and
// the narration says "hundreds of times", never a number.
const arr = textOf(numpy as Cell[], 7)
const loop = textOf(numpy as Cell[], 8, 'stream').split(' per loop')[0]
const vec = textOf(numpy as Cell[], 9, 'stream').split(' per loop')[0]
const sqftAt = (i: number) => head.rows[i][head.columns.indexOf('sqft') + 1]
export const setupNumpy: SceneModel = notebookFrame({
  tree: tree({ active: FILE }), file: FILE, cells: numpy as Cell[], show: [6, 7, 8, 9],
  side: [
    {
      type: 'group', id: 'layout', title: 'Two ways to hold 1,460 numbers', icon: 'layers', tone: 'ingest', dir: 'row', children: [
        {
          type: 'group', id: 'array', title: 'NumPy array', sub: /dtype\('(\w+)'\)/.exec(arr)![1] + ', side by side', tone: 'store', children: [
            { type: 'table', id: 'cells', rows: [0, 1, 2, 3, 4].map((i) => [sqftAt(i)]).concat([['…']]) },
            { type: 'item', id: 'bytes', title: `${/, (\d+)\)$/.exec(arr)![1]} bytes`, sub: '8 per number, nothing else', chip: true },
          ],
        },
        {
          type: 'group', id: 'list', title: 'Python list', sub: 'pointers to objects', tone: 'consume', children: [0, 1, 2].map((i) => ({
            type: 'group' as const, id: `pair${i}`, bare: true, dir: 'row' as const, children: [
              { type: 'item' as const, id: `p${i}`, title: `[${i}] ●`, chip: true },
              { type: 'table' as const, id: `o${i}`, title: 'int object', rows: [[sqftAt(i)]] },
            ],
          })),
        },
      ],
    },
    {
      type: 'table', id: 'timing', title: '1,460 sizes ÷ 10.764 (sq ft → m²), timed', tone: 'ingest', columns: ['how', 'one run'], rows: [
        { cells: ['a Python loop', loop], tone: 'consume' },
        { cells: ['the NumPy array', vec], tone: 'store' },
      ],
    },
    { type: 'note', id: 'np-note', tone: 'store', text: 'pandas columns are NumPy arrays underneath: work on whole columns, never loop over rows.' },
  ],
  edges: [0, 1, 2].map((i) => ({ from: `p${i}`, to: `o${i}` })),
})
