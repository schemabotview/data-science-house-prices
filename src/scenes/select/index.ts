import type { SceneModel } from '@graphlearning/graphl-flow'
import { SIDE_PLOT_W } from '../grid'
import { notebookFrame, num, outputOf, seriesOf, textOf, type Cell } from '../notebook'
import { tree } from '../tree'
import s1 from '../../../spine/select/01-loc/cells.json'
import s2 from '../../../spine/select/02-masks/cells.json'
import s3 from '../../../spine/select/03-sorting/cells.json'
import s4 from '../../../spine/select/04-new-columns/cells.json'
import s5 from '../../../spine/select/05-text/cells.json'
import s6 from '../../../spine/select/06-dates/cells.json'
import s7 from '../../../spine/select/07-copy-on-write/cells.json'
import first from '../../../spine/setup/03-first-cells/cells.json'
import anatomy from '../../../spine/setup/04-dataframe/cells.json'

// Course 3 — ask the table questions, in notebooks/select.ipynb. Every value in a side pane is read
// from the step's cells.json (the kernel's output), never typed.
const FILE = 'notebooks/select.ipynb'
const files = { active: FILE, notebooks: ['explore.ipynb', 'select.ipynb'] }
const C = (x: unknown) => x as Cell[]

// §3.1 — .loc (labels) and .iloc (positions): the same cell two ways.
const head3 = outputOf(C(s1), 2).table!
export const selectLoc: SceneModel = notebookFrame({
  tree: tree({ ...files, fresh: [FILE] }), file: FILE, cells: C(s1),
  side: [
    {
      type: 'table', id: 'grid', title: 'homes: labels, and positions', tone: 'ingest',
      columns: ['label', 'position', 'area · col 3', 'sqft', 'beds'],
      rows: head3.rows.map((r, i) => ({ id: `r${i}`, cells: [r[0], String(i), ...r.slice(1)], tone: i === 2 ? 'store' as const : undefined })),
    },
    {
      type: 'group', id: 'two-ways', title: 'one cell, asked two ways', icon: 'search', tone: 'store', children: [
        { type: 'item', id: 'by-label', title: 'homes.loc[2, "area"]', sub: `by the row's label, 2, and the column's name: ${textOf(C(s1), 3)}`, icon: 'table' },
        { type: 'item', id: 'by-pos', title: 'homes.iloc[2, 3]', sub: `by the 3rd row and the 4th column, counted from 0: ${textOf(C(s1), 4)}`, icon: 'layers' },
        { type: 'item', id: 'agree', title: 'the same, for now', sub: 'labels are 0, 1, 2 … in order until a sort moves rows (§3.3)', icon: 'check', tone: 'store' },
      ],
    },
  ],
})

// §3.2 — a boolean mask: a True/False Series, one per row, used to keep rows.
const mask = seriesOf(textOf(C(s2), 5))
const riverside = num(textOf(C(s2), 6))
const kept = textOf(C(s2), 7)
export const selectMasks: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(s2), show: [5, 6, 7],
  side: [
    {
      type: 'group', id: 'masking', title: 'homes[mask]: keep the True rows', icon: 'filter', tone: 'ingest', children: [
        { type: 'group', id: 'lineup', bare: true, dir: 'row', children: [
          { type: 'table', id: 'areas', title: 'area', rows: head3.rows.map((r) => ({ id: `a${r[0]}`, cells: [r[1]] })) },
          { type: 'table', id: 'mask', title: '== "Riverside"', rows: mask.map(([k, v]) => ({ id: `m${k}`, cells: [v], tone: v === 'True' ? 'store' as const : undefined })) },
        ] },
        { type: 'item', id: 'sum', title: `riverside.sum(): ${riverside}`, sub: 'True counts as 1 — not every Riverside: "Riverside " has a space', icon: 'check', tone: 'store' },
        { type: 'item', id: 'big', title: `riverside & (sqft > 2000): ${kept}`, sub: 'two masks, one pair of brackets each', icon: 'filter' },
      ],
    },
    {
      type: 'table', id: 'ops', title: 'combining masks', tone: 'ingest', columns: ['operator', 'means', 'example'], rows: [
        ['&', 'and', 'riverside & big'],
        ['|', 'or', 'riverside | old_town'],
        ['~', 'not', '~riverside'],
      ],
    },
  ],
  edges: head3.rows.map((r) => ({ from: `areas.a${r[0]}`, to: `mask.m${r[0]}` })),
})

// §3.3 — sorting: rows keep their labels, so .loc and .iloc now disagree.
const top = outputOf(C(s3), 8).table!
const [byLabel, byPosition] = /\('(.*)', '(.*)'\)/.exec(textOf(C(s3), 9))!.slice(1)
export const selectSorting: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(s3), show: [8, 9],
  side: [
    {
      type: 'table', id: 'top', title: 'top: the 5 largest, labels kept', tone: 'ingest', columns: ['position', 'label', 'area', 'sqft'],
      rows: top.rows.map((r, i) => ({ id: `t${i}`, cells: [String(i), r[0], r[1], r[2]], tone: r[0] === '1' ? 'store' as const : i === 1 ? 'infra' as const : undefined })),
    },
    {
      type: 'group', id: 'disagree', title: 'now .loc and .iloc disagree', icon: 'search', tone: 'store', children: [
        { type: 'item', id: 'd-label', title: 'top.loc[1, "area"]', sub: `the row labelled 1, wherever it is now: ${byLabel}`, icon: 'table', tone: 'store' },
        { type: 'item', id: 'd-pos', title: 'top.iloc[1]["area"]', sub: `whatever row is 2nd now: ${byPosition}`, icon: 'layers', tone: 'infra' },
      ],
    },
  ],
})

// §3.4 — new columns by arithmetic on whole columns; and the first real wall: price is text.
const ages = outputOf(C(s4), 10).table!
const err = outputOf(C(s4), 11, 'error')
// Missing years, from Course 2's info(): built's non-null count against the row count.
const builtPresent = Number(/built\s+(\d+) non-null/.exec(textOf(C(anatomy), 3, 'stream'))![1])
const rowsAll = Number(/RangeIndex: (\d+) entries/.exec(textOf(C(anatomy), 3, 'stream'))![1])
export const selectNewColumns: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(s4), show: [10, 11],
  side: [
    {
      type: 'group', id: 'arith', title: 'homes["age"] = 2026 - homes["built"]', icon: 'zap', tone: 'store', children: [
        { type: 'group', id: 'cols', bare: true, dir: 'row', children: [
          { type: 'table', id: 'built', title: 'built', rows: ages.rows.map((r) => ({ id: `b${r[0]}`, cells: [r[1]] })) },
          { type: 'table', id: 'age', title: 'age', rows: ages.rows.map((r) => ({ id: `g${r[0]}`, cells: [r[2]] })) },
        ] },
        { type: 'item', id: 'nan-io', title: `NaN in, NaN out: ${rowsAll - builtPresent} missing`, sub: 'a missing year gives a missing age; pandas never invents one', icon: 'search' },
      ],
    },
    {
      type: 'table', id: 'wall', title: `${err.ename}: price / sqft`, tone: 'consume', columns: ['column', 'dtype', '÷ works?'], rows: [
        ['sqft', 'int64', 'yes'],
        { cells: ['price', 'str', 'no: text'], tone: 'consume' },
      ],
    },
  ],
  edges: ages.rows.map((r) => ({ from: `built.b${r[0]}`, to: `age.g${r[0]}`, label: r === ages.rows[0] ? '2026 −' : undefined })),
})

// §3.5 — text: value_counts shows the spellings; .str.strip() merges "Riverside ". Category memory.
// The printed counts end each name at the column gap, so "Riverside " prints as a second
// "Riverside": value_counts sorts by count, and the second one is the spaced spelling.
const seen = new Set<string>()
const spelled = (k: string) => { const name = seen.has(k) ? `"${k} "` : `"${k}"`; seen.add(k); return name }
const before = seriesOf(textOf(C(s5), 12)).map(([k, v]) => [spelled(k), v])
const after = new Map(seriesOf(textOf(C(s5), 13)).map(([k, v]) => [`"${k}"`, v]))
const [asText, asCategory] = /\((\d+), (\d+)\)/.exec(textOf(C(s5), 14))!.slice(1).map(Number)
export const selectText: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(s5), show: [12, 13, 14], view: { 12: { head: 4, tail: 3 }, 13: { head: 4, tail: 2 } },
  side: [
    {
      type: 'table', id: 'spellings', title: 'area: before and after .str.strip()', tone: 'ingest', columns: ['spelled', 'before', 'after'],
      rows: before.map(([k, v]) => ({
        cells: [k, v, after.get(k) ?? 'merged'],
        tone: k === '"Riverside "' ? 'store' as const : k === '"Old town"' ? 'consume' as const : undefined,
      })),
    },
    {
      type: 'plot', id: 'memory', compact: true, w: SIDE_PLOT_W, title: 'memory for 1,460 areas (bytes)', tone: 'ingest',
      x: { labels: ['str', 'category'] }, y: { min: 0, max: 90000, step: 30000 },
      series: [{ kind: 'bar', points: [[0, asText], [1, asCategory]], label: 'bytes' }],
    },
  ],
})

// §3.6 — dates: one format fails on the other; parse each format, then combine.
const dateErr = outputOf(C(s6), 15, 'error')
// Two real sold values (rows 0 and 1 of head()): one ISO, one day-first.
const sold = outputOf(C(first), 2).table!.rows.slice(0, 2).map((r) => r[2])
const ukToIso = (t: string) => t.split('/').reverse().join('-')
const years = seriesOf(textOf(C(s6), 17))
export const selectDates: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(s6), show: [15, 16, 17],
  side: [
    {
      type: 'table', id: 'parse', title: `${dateErr.ename}, so: two parsers, one column`, tone: 'ingest', columns: ['as text', 'parsed as', 'gives'], rows: [
        [sold[0], 'ISO', sold[0]],
        { cells: [sold[1], 'day first', ukToIso(sold[1])], tone: 'store' },
      ],
    },
    {
      type: 'plot', id: 'per-year', compact: true, w: SIDE_PLOT_W, title: 'sales per year (2026: to September)', tone: 'store',
      x: { labels: years.map(([y]) => y) }, y: { min: 0, max: 300, step: 100 },
      series: [{ kind: 'bar', points: years.map(([, v], i) => [i, Number(v)]), label: 'sales' }],
    },
  ],
})

// §3.7 — Copy-on-Write: a chained assignment changes a temporary copy; .loc changes the frame.
export const selectCopyOnWrite: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(s7), show: [18, 19], view: { 18: { head: 4, tail: 2 } },
  side: [
    {
      type: 'group', id: 'chained', title: 'demo[mask]["beds"] = 2', icon: 'layers', tone: 'consume', children: [
        { type: 'item', id: 'ch-demo', title: 'demo', sub: 'the frame you meant to change', icon: 'table' },
        { type: 'item', id: 'ch-copy', title: 'demo[mask]', sub: 'a NEW object: behaves as a copy', icon: 'file' },
        { type: 'item', id: 'ch-set', title: '["beds"] = 2', sub: 'sets the copy, which is thrown away', icon: 'zap' },
      ],
    },
    {
      type: 'table', id: 'results', title: 'demo["beds"].max(), after each', tone: 'store', columns: ['assignment', 'max beds'], rows: [
        { cells: ['chained: demo[mask]["beds"] = 2', String(num(outputOf(C(s7), 18).text!))], tone: 'consume' },
        { cells: ['one step: demo.loc[mask, "beds"] = 2', String(num(outputOf(C(s7), 19).text!))], tone: 'store' },
      ],
    },
  ],
  edges: [{ from: 'ch-demo', to: 'ch-copy', label: 'select' }, { from: 'ch-copy', to: 'ch-set' }],
})

export const selectScenes: Record<string, SceneModel> = {
  'select-loc': selectLoc,
  'select-masks': selectMasks,
  'select-sorting': selectSorting,
  'select-new-columns': selectNewColumns,
  'select-text': selectText,
  'select-dates': selectDates,
  'select-copy-on-write': selectCopyOnWrite,
}
