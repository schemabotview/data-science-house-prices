import type { SceneModel } from '@graphlearning/graphl-flow'
import { SIDE_PLOT_W } from '../grid'
import { figurePlot, notebookFrame, outputOf, seriesOf, textOf, type Cell } from '../notebook'
import { tree } from '../tree'
import v1 from '../../../spine/see/01-distributions/cells.json'
import v2 from '../../../spine/see/02-log/cells.json'
import v3 from '../../../spine/see/03-scatter/cells.json'
import v4 from '../../../spine/see/04-groups/cells.json'
import v5 from '../../../spine/see/05-corr/cells.json'
import v6 from '../../../spine/see/06-honest/cells.json'

// Course 6 — see it, in notebooks/see.ipynb. Every chart in a cell is the kernel's own matplotlib
// figure, redrawn from the data it plotted (cells.json `figure`); every number in a side pane is the
// kernel's text.
const FILE = 'notebooks/see.ipynb'
const files = { active: FILE, notebooks: ['explore.ipynb', 'select.ipynb', 'clean.ipynb', 'shape.ipynb', 'see.ipynb'], data: ['areas.csv', 'homes.csv', 'homes_clean.csv'] }
const C = (x: unknown) => x as Cell[]
const thousands = (n: number) => Math.round(n).toLocaleString('en-GB')

// §6.1 — a distribution: the histogram, and why mean and median disagree.
const stats = new Map(seriesOf(textOf(C(v1), 1)))
export const seeDistributions: SceneModel = notebookFrame({
  tree: tree({ ...files, fresh: [FILE] }), file: FILE, cells: C(v1), view: { 1: { show: [[5, 8]] }, 2: { xScale: 1000, compact: true } },
  side: [
    {
      type: 'group', id: 'tail', title: 'a long right tail', icon: 'chart', tone: 'ingest', children: [
        { type: 'item', id: 'tail-many', title: `most sales: near £${Math.round(Number(stats.get('median')) / 1000)}k`, sub: 'the tall bars, around the median', icon: 'chart' },
        { type: 'item', id: 'tail-few', title: 'a few dear houses, far out', sub: 'they pull the mean up; the median stays', icon: 'globe', tone: 'consume' },
        { type: 'item', id: 'tail-skew', title: `skew ${stats.get('skew')}: above 0`, sub: 'a longer tail on the right — quote the median', icon: 'search', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'centre', title: 'two centres, and the skew', tone: 'ingest', columns: ['', 'price'], rows: [
        ['mean', `£${thousands(Number(stats.get('mean')))}`],
        ['median', `£${thousands(Number(stats.get('median')))}`],
        { cells: ['skew', stats.get('skew')!], tone: 'consume' },
      ],
    },
  ],
  edges: [{ from: 'tail-many', to: 'tail-few' }, { from: 'tail-few', to: 'tail-skew' }],
})

// §6.2 — the log scale: equal ratios become equal distances, and the skew disappears.
const lg = (v: number) => Math.log10(v).toFixed(3)
export const seeLog: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(v2), show: [3, 4], view: { 3: { compact: true } },
  side: [
    { ...figurePlot('raw-hist', C(v1).find((c) => c.cell === 2)!.figure![0], { compact: true, w: SIDE_PLOT_W, xScale: 1000 }), title: 'price, before the log (cell 2)' },
    {
      type: 'table', id: 'ratios', title: '+10% is the same step anywhere on a log scale', tone: 'ingest', columns: ['price', 'log10', 'step'], rows: [
        ['£200,000', lg(200000), ''], ['£220,000', lg(220000), '+0.041'],
        ['£500,000', lg(500000), ''], ['£550,000', lg(550000), '+0.041'],
      ],
    },
  ],
})

// §6.3 — a relationship: price against size, and its correlation.
const r = Number(/[\d.]+/.exec(textOf(C(v3), 6).replace('np.float64(', ''))![0])
export const seeScatter: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(v3), show: [5, 6], view: { 5: { yScale: 1000 } },
  side: [
    {
      type: 'table', id: 'r', title: 'correlation, sqft with price', tone: 'store', columns: ['r', 'means'], rows: [
        ['+1', 'a perfect rising line'],
        { cells: [String(r), 'strong, rising'], tone: 'store' },
        ['0', 'no straight-line link'],
        ['−1', 'a perfect falling line'],
      ],
    },
    {
      type: 'group', id: 'reading', title: 'what else the scatter shows', icon: 'search', tone: 'ingest', children: [
        { type: 'item', id: 'fan', title: 'the cloud widens to the right', sub: 'big houses vary more in price, in pounds', icon: 'chart' },
        { type: 'item', id: 'nogap', title: 'no cluster far below the rest', sub: 'the m² batch is fixed: cleaning worked', icon: 'check' },
      ],
    },
  ],
})

// §6.4 — comparing groups: median and the middle half per area, drawn as bars and lines.
const spread = outputOf(C(v4), 7).table!
export const seeGroups: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(v4), show: [7, 8], view: { 7: { rows: 1 }, 8: { yScale: 1000, compact: true } },
  side: [
    {
      type: 'table', id: 'iqr', title: 'the middle half, per area (£k)', tone: 'ingest', columns: ['area', '25%', 'median', '75%'],
      rows: spread.rows.map((row) => ({ cells: [row[0], ...row.slice(1).map((v) => String(Math.round(Number(v) / 1000)))], tone: ['Eastfield', 'Riverside'].includes(row[0]) ? 'store' as const : undefined })),
    },
    {
      type: 'group', id: 'overlap', title: 'the middle halves overlap', icon: 'chart', tone: 'consume', children: [
        { type: 'item', id: 'east-top', title: `Eastfield’s dearer quarter: from £${Math.round(Number(spread.rows[0][3]) / 1000)}k`, sub: 'its 75th percentile', icon: 'chart' },
        { type: 'item', id: 'river-low', title: `Riverside’s cheaper quarter: up to £${Math.round(Number(spread.rows.at(-1)![1]) / 1000)}k`, sub: 'its 25th percentile: lower — a median alone hides that', icon: 'chart', tone: 'consume' },
      ],
    },
  ],
  edges: [{ from: 'east-top', to: 'river-low', label: '>' }],
})

// §6.5 — correlation across every numeric column, and what it can and cannot see.
const withPrice = seriesOf(textOf(C(v5), 10))
const m9 = outputOf(C(v5), 9).table!
const at9 = (a: string, b: string) => m9.rows.find((r) => r[0] === a)![m9.columns.indexOf(b) + 1]
export const seeCorr: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(v5), show: [9, 10],
  side: [
    {
      type: 'table', id: 'corr-bars', title: 'correlation with price (cell 10)', tone: 'ingest', columns: ['column', 'r', ''],
      rows: [...withPrice].reverse().map(([k, v]) => ({
        cells: [k, v, (Number(v) < 0 ? '◀' : '') + '█'.repeat(Math.round(Math.abs(Number(v)) * 12))],
        tone: Math.abs(Number(v)) > 0.5 ? 'store' as const : undefined,
      })),
    },
    {
      type: 'group', id: 'twins', title: 'two columns, one piece of information', icon: 'layers', tone: 'consume', children: [
        { type: 'item', id: 'tw-sqft', title: 'sqft', sub: `r with price ${at9('sqft', 'price')}: the size`, icon: 'layers', tone: 'store' },
        { type: 'item', id: 'tw-beds', title: 'beds', sub: `r with price ${at9('beds', 'price')}: mostly the size again`, icon: 'layers' },
      ],
    },
  ],
  edges: [{ from: 'tw-sqft', to: 'tw-beds', label: `r ${at9('sqft', 'beds')}` }],
})

// §6.6 — honest charts: the same two medians, from zero and from £220k.
const ratio = Number(/[\d.]+/.exec(textOf(C(v6), 13).replace('np.float64(', ''))![0])
const bars = C(v6).find((c) => c.cell === 12)!.figure![0]
const floor = bars.ylim[0]
const [east, river] = bars.bars.map((b) => b[2] + b[3])
const looks = (river - floor) / (east - floor)
export const seeHonest: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(v6), show: [12], view: { 12: { compact: true, yScale: 1000 } },
  side: [
    figurePlot('from-zero', C(v6).find((c) => c.cell === 11)!.figure![0], { compact: true, w: SIDE_PLOT_W, yScale: 1000, tone: 'store' }),
    {
      type: 'table', id: 'rules', title: `honest-chart rules, and cell 13: really ${ratio}×`, tone: 'store', columns: ['chart', 'rule'], rows: [
        { cells: ['bars from 0', `length is the claim: ${ratio}×`], tone: 'store' },
        { cells: [`from £${floor / 1000}k`, `bars cut: look ${looks.toFixed(1)}×`], tone: 'consume' },
        ['lines, scatter', 'may zoom: position'],
        ['any', 'label the axis, unit'],
      ],
    },
  ],
})

export const seeScenes: Record<string, SceneModel> = {
  'see-distributions': seeDistributions,
  'see-log': seeLog,
  'see-scatter': seeScatter,
  'see-groups': seeGroups,
  'see-corr': seeCorr,
  'see-honest': seeHonest,
}
