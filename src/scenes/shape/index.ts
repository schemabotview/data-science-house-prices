import type { SceneModel } from '@graphlearning/graphl-flow'
import { notebookFrame, outputOf, seriesOf, textOf, type Cell } from '../notebook'
import { tree } from '../tree'
import g1 from '../../../spine/shape/01-groupby/cells.json'
import g2 from '../../../spine/shape/02-agg/cells.json'
import g3 from '../../../spine/shape/03-pivot/cells.json'
import g4 from '../../../spine/shape/04-merge/cells.json'
import g6 from '../../../spine/shape/06-time/cells.json'
import g7 from '../../../spine/shape/07-long-wide/cells.json'

// Course 5 — group, combine, reshape, in notebooks/shape.ipynb, from homes_clean.csv. Every number
// in a side pane is the kernel's (cells.json).
const FILE = 'notebooks/shape.ipynb'
const NOTEBOOKS = ['explore.ipynb', 'select.ipynb', 'clean.ipynb', 'shape.ipynb']
const files = { active: FILE, notebooks: NOTEBOOKS, data: ['homes.csv', 'homes_clean.csv'] }
const withAreas = { ...files, data: ['areas.csv', 'homes.csv', 'homes_clean.csv'] }
const C = (x: unknown) => x as Cell[]
const k = (v: string | number) => `£${Math.round(Number(v) / 1000)}k`

// §5.1 — groupby: split by area, apply median, combine into one Series.
const medians = seriesOf(textOf(C(g1), 2))
const sales = new Map(outputOf(C(g2), 3).table!.rows.map((r) => [r[0], r[1]]))
const id = (a: string) => a.replace(/\W/g, '')
export const shapeGroupby: SceneModel = notebookFrame({
  tree: tree({ ...files, fresh: [FILE] }), file: FILE, cells: C(g1),
  side: [
    {
      type: 'group', id: 'sac', title: 'split → apply → combine', icon: 'workflow', tone: 'ingest', dir: 'row', children: [
        {
          type: 'table', id: 'split', title: 'split: area, sales',
          rows: medians.map(([a]) => ({ id: id(a), cells: [a, sales.get(a)!] })),
        },
        {
          type: 'table', id: 'combined', title: 'median price', tone: 'store',
          rows: medians.map(([a, v]) => ({ id: id(a), cells: [k(v)], tone: a === 'Old town' ? 'consume' as const : undefined })),
        },
      ],
    },
    {
      type: 'code', id: 'gb-loop', filename: 'the same, as a loop you would write', lang: 'python', code: [
        'medians = {}',
        'for area, group in homes.groupby("area"):',
        '    medians[area] = group["price"].median()',
      ].join('\n'),
    },
    {
      type: 'table', id: 'apply', title: 'the apply step can be any summary', tone: 'ingest', columns: ['…["price"]', 'gives, per area'], rows: [
        ['.median()', 'the middle price'],
        ['.size()', 'how many sales'],
        ['.max()', 'the dearest sale'],
      ],
    },
    { type: 'note', id: 'gb-note', tone: 'consume', text: 'Six groups, not five: "Old town" is still its own area. groupby trusts the spelling, exactly like ==.' },
  ],
  edges: medians.map(([a]) => ({ from: `split.${id(a)}`, to: `combined.${id(a)}` })),
})

// §5.2 — agg with named aggregations: several statistics per group, one table.
const agg = outputOf(C(g2), 3).table!
export const shapeAgg: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(g2), show: [3],
  side: [
    {
      type: 'table', id: 'per-sqft', title: 'median £ per sq ft, by area', tone: 'store', columns: ['area', '£/sq ft', ''],
      rows: agg.rows.map((r) => ({ cells: [r[0], r[3].replace('.0', ''), '█'.repeat(Math.round(Number(r[3]) / 20))], tone: r[0] === 'Riverside' ? 'store' as const : undefined })),
    },
    {
      type: 'table', id: 'named', title: 'a named aggregation', tone: 'ingest', columns: ['new column', '= (column', 'function)'], rows: [
        ['sales', '"price"', '"size"'],
        ['median_price', '"price"', '"median"'],
        ['median_per_sqft', '"per_sqft"', '"median"'],
      ],
    },
    {
      type: 'table', id: 'ranks', title: 'rank by price, and by price per sq ft', tone: 'ingest', columns: ['area', 'by price', 'by £/sq ft'],
      rows: (() => {
        const byPrice = [...agg.rows].sort((a, b) => Number(b[2]) - Number(a[2])).map((r) => r[0])
        const bySqft = [...agg.rows].sort((a, b) => Number(b[3]) - Number(a[3])).map((r) => r[0])
        return agg.rows.map((r) => ({ cells: [r[0], String(byPrice.indexOf(r[0]) + 1), String(bySqft.indexOf(r[0]) + 1)] }))
      })(),
    },
    { type: 'note', id: 'agg-note', tone: 'store', text: 'per_sqft works now: price became a number in Course 4. Riverside costs the most per square foot, not just per house.' },
  ],
})

// §5.3 — pivot_table: two groupings at once, a grid.
const pivot = outputOf(C(g3), 4).table!
// Beds 1–5: the 6-bed cells stand on a handful of sales each (the narration says so).
const line = (area: string) => pivot.rows.find((r) => r[0] === area)!.slice(1, 6).map((v, i) => [Number(pivot.columns[i]), Number(v) / 1000] as [number, number])
export const shapePivot: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(g3), show: [4],
  side: [
    {
      type: 'group', id: 'roles', title: 'pivot_table(…)', icon: 'table', tone: 'ingest', dir: 'grid', cols: 2, children: [
        { type: 'item', id: 'pv-index', title: 'index="area"', sub: 'one row per area', chip: true },
        { type: 'item', id: 'pv-cols', title: 'columns="beds"', sub: 'one column per bed count', chip: true },
        { type: 'item', id: 'pv-vals', title: 'values="price"', sub: 'what fills the cells', chip: true },
        { type: 'item', id: 'pv-agg', title: 'aggfunc="median"', sub: 'how a cell sums up its sales', chip: true },
      ],
    },
    {
      type: 'plot', id: 'by-beds', compact: true, title: 'median price (£k) by bedrooms', tone: 'store',
      x: { min: 1, max: 6, step: 1, label: 'beds' }, y: { min: 100, max: 500, step: 100 },
      series: [{ kind: 'line', label: 'Riverside', points: line('Riverside') }, { kind: 'line', label: 'Eastfield', points: line('Eastfield') }],
    },
  ],
})

// §5.4 — merge: the join that failed on "Old town", found with indicator and validate, then fixed.
const merged = seriesOf(textOf(C(g4), 6))
const areas = outputOf(C(g4), 5).table!
const homeKeys = ['Riverside', 'Old Town', 'Old town']
export const shapeMerge: SceneModel = notebookFrame({
  tree: tree({ ...withAreas, fresh: ['data/areas.csv'] }), file: FILE, cells: C(g4), show: [5, 6, 7, 9],
  side: [
    {
      type: 'group', id: 'keys', title: 'joining on area', icon: 'key', tone: 'ingest', dir: 'row', children: [
        { type: 'table', id: 'hk', title: 'homes.area', rows: homeKeys.map((a) => ({ id: id(a), cells: [a], tone: a === 'Old town' ? 'consume' as const : undefined })) },
        { type: 'table', id: 'ak', title: 'areas.area', rows: areas.rows.map((r) => ({ id: id(r[1]), cells: [r[1]] })) },
      ],
    },
    {
      type: 'table', id: 'indicator', title: 'indicator=True: where each row came from', tone: 'store', columns: ['_merge', 'rows'],
      rows: merged.map(([m, n]) => ({ cells: [m, n], tone: m === 'left_only' && n !== '0' ? 'consume' as const : undefined })),
    },
    { type: 'note', id: 'merge-note', tone: 'store', text: 'validate="many_to_one" checks each area appears once in areas; indicator finds the rows that matched nothing. .str.title() fixes the spelling.' },
  ],
  edges: [{ from: 'hk.Riverside', to: 'ak.Riverside' }, { from: 'hk.OldTown', to: 'ak.OldTown' }],
})

// §5.5 — ◆ full scene: the four joins, with the real row counts BEFORE the spelling fix.
const counts = Object.fromEntries([...textOf(C(g4), 8).matchAll(/'(\w+)': (\d+)/g)].map((m) => [m[1], m[2]]))
const unmatched = merged.find(([m]) => m === 'left_only')![1]
const joinBox = (how: string, rule: string, tone: 'source' | 'ingest' | 'store' | 'serve') => ({
  type: 'group' as const, id: `j-${how}`, title: `how="${how}"`, tone, children: [
    { type: 'item' as const, id: `j-${how}-rule`, title: rule, icon: 'filter' },
    { type: 'item' as const, id: `j-${how}-n`, title: `${counts[how]} rows`, chip: true },
  ],
})
export const shapeJoins: SceneModel = {
  title: 'Four ways to join',
  sub: `homes (${counts.left} sales) merged with areas (${areas.rows.length} areas) on "area", while ${unmatched} sales still say "Old town"`,
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'inputs', bare: true, children: [
        { type: 'table', id: 'left-keys', title: 'left: homes.area', tone: 'ingest', rows: ['Riverside', 'Old Town', 'Old town', '…'].map((a) => ({ id: id(a) || 'more', cells: [a], tone: a === 'Old town' ? 'consume' as const : undefined })) },
        { type: 'table', id: 'right-keys', title: 'right: areas.area', tone: 'ingest', rows: areas.rows.map((r) => ({ id: id(r[1]), cells: [r[1]] })) },
      ],
    },
    {
      type: 'group', id: 'joins', bare: true, dir: 'grid', cols: 2, children: [
        joinBox('inner', 'only keys found on both sides', 'store'),
        joinBox('left', 'every left row; NaN where no match', 'ingest'),
        joinBox('right', 'every right row; NaN where no match', 'source'),
        joinBox('outer', 'every row from both sides', 'serve'),
      ],
    },
    {
      type: 'group', id: 'lesson', bare: true, children: [
        { type: 'note', id: 'j-note', tone: 'consume', text: `inner silently lost ${unmatched} sales. Nothing failed, the row count just shrank. That is the danger of a join.` },
        {
          type: 'table', id: 'habits', title: 'join habits', tone: 'store', columns: ['do', 'because'], rows: [
            ['how="left" first', 'keeps every sale'],
            ['indicator=True', 'shows what matched nothing'],
            ['validate="many_to_one"', 'fails if a key repeats on the right'],
            ['check the row count', 'before and after'],
          ],
        },
      ],
    },
  ],
  edges: [{ from: 'inputs', to: 'joins' }, { from: 'joins', to: 'lesson' }],
}

// §5.6 — time: resample by quarter, then a rolling mean to see the trend through the noise.
const trend = outputOf(C(g6), 10).table!
const growth = Number(textOf(C(g6), 11))
const quarter = (d: string) => Number(d.slice(0, 4)) + (Number(d.slice(5, 7)) - 1) / 12
export const shapeTime: SceneModel = notebookFrame({
  tree: tree(withAreas), file: FILE, cells: C(g6), show: [10, 11], view: { 10: { rows: 6 } },
  side: [
    {
      type: 'plot', id: 'trend', compact: true, title: 'median price (£k): each quarter, and rolling', tone: 'store',
      x: { min: 2020.75, max: 2027, step: 1 }, y: { min: 200, max: 320, step: 40 },
      series: [
        { kind: 'line', points: trend.rows.map((r) => [quarter(r[0]), Number(r[1]) / 1000]) },
        { kind: 'line', label: 'rolling', points: trend.rows.filter((r) => r[2] !== 'NaN').map((r) => [quarter(r[0]), Number(r[2]) / 1000]) },
      ],
    },
    {
      type: 'table', id: 'resample', title: 'two time tools', tone: 'ingest', columns: ['call', 'does'], rows: [
        ['.resample("QS")', 'one row per quarter, by date'],
        ['.rolling(4).mean()', 'average of the last four'],
        { cells: ['rolling: first → last', `+${(growth * 100).toFixed(1)}%`], tone: 'store' },
      ],
    },
  ],
})

// §5.7 — long and wide: the same 30 numbers, two shapes; melt and pivot convert.
const wide = outputOf(C(g7), 12).table!
const long = outputOf(C(g7), 13).table!
const [wideShape, longShape] = [...textOf(C(g7), 14).matchAll(/\(\d+, \d+\)/g)].map((m) => m[0])
export const shapeLongWide: SceneModel = notebookFrame({
  tree: tree(withAreas), file: FILE, cells: C(g7), show: [12, 13, 14],
  side: [
    {
      type: 'table', id: 'wide-x', title: `wide ${wideShape}: a column per area`, tone: 'ingest', columns: ['sold', ...wide.columns.slice(0, 3), '…'],
      rows: wide.rows.slice(0, 3).map((r) => [r[0], ...r.slice(1, 4).map(k), '…']),
    },
    {
      type: 'table', id: 'long-x', title: `long ${longShape}: a row per (year, area)`, tone: 'store', columns: long.columns,
      rows: long.rows.slice(0, 3).map((r) => [r[1], r[2], k(r[3])]),
    },
    {
      type: 'table', id: 'melt-args', title: '.melt(id_vars="sold", value_name="median")', tone: 'ingest', columns: ['part', 'becomes'], rows: [
        ['id_vars="sold"', 'kept: repeated on every row'],
        ['each other column\'s name', 'a value in "area"'],
        ['each cell', 'a value in "median"'],
      ],
    },
    { type: 'note', id: 'lw-note', tone: 'ingest', text: 'Wide reads well as a table. Long is what groupby, plots and models want. .melt() goes wide → long, .pivot() back.' },
  ],
  edges: [{ from: 'wide-x', to: 'long-x', label: '.melt(id_vars="sold")' }],
})

export const shapeScenes: Record<string, SceneModel> = {
  'shape-groupby': shapeGroupby,
  'shape-agg': shapeAgg,
  'shape-pivot': shapePivot,
  'shape-merge': shapeMerge,
  'shape-joins': shapeJoins,
  'shape-time': shapeTime,
  'shape-long-wide': shapeLongWide,
}
