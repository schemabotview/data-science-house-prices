import type { SceneModel } from '@graphlearning/graphl-flow'
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
  tree: tree({ ...files, fresh: [FILE] }), file: FILE, cells: C(v1), view: { 2: { xScale: 1000 } },
  side: [
    {
      type: 'table', id: 'centre', title: 'two centres, and the skew', tone: 'ingest', columns: ['', 'price'], rows: [
        ['mean', `£${thousands(Number(stats.get('mean')))}`],
        ['median', `£${thousands(Number(stats.get('median')))}`],
        { cells: ['skew', stats.get('skew')!], tone: 'consume' },
      ],
    },
    {
      type: 'group', id: 'tail', title: 'a long right tail', icon: 'chart', tone: 'ingest', children: [
        { type: 'item', id: 'tail-many', title: `most sales: near £${Math.round(Number(stats.get('median')) / 1000)}k`, sub: 'the tall bars', chip: true },
        { type: 'item', id: 'tail-few', title: 'a few dear houses, far out', sub: 'they pull the mean up, not the median', chip: true },
      ],
    },
    (() => {
      const f = C(v1).find((c) => c.cell === 2)!.figure![0]
      const top = f.bars.reduce((a, b) => (b[3] > a[3] ? b : a))
      return {
        type: 'table' as const, id: 'hist', title: 'the histogram, in numbers', tone: 'ingest' as const, columns: ['', ''], rows: [
          ['bins', `${f.bars.length}, each £${(f.bars[0][1] / 1000).toFixed(0)}k wide`],
          ['tallest bin', `£${top[0] / 1000}k–£${(top[0] + top[1]) / 1000}k: ${top[3]} sales`],
          ['sales in the bars', String(f.bars.reduce((n, b) => n + b[3], 0))],
        ],
      }
    })(),
    { type: 'note', id: 'dist-note', tone: 'store', text: 'Skew above 0 means a right tail. For prices, quote the median: it is the price of the house in the middle.' },
  ],
  edges: [{ from: 'tail-many', to: 'tail-few' }],
})

// §6.2 — the log scale: equal ratios become equal distances, and the skew disappears.
const logStats = new Map(seriesOf(textOf(C(v2), 4)))
const lg = (v: number) => Math.log10(v).toFixed(3)
export const seeLog: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(v2), show: [3, 4],
  side: [
    {
      type: 'table', id: 'skews', title: 'skew, before and after', tone: 'store', columns: ['', 'skew', 'mean − median'], rows: [
        { cells: ['price', stats.get('skew')!, `£${thousands(Number(stats.get('mean')) - Number(stats.get('median')))}`], tone: 'consume' },
        { cells: ['log10(price)', logStats.get('skew')!, (Number(logStats.get('mean')) - Number(logStats.get('median'))).toFixed(3)], tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'ratios', title: '+10% is the same step anywhere on a log scale', tone: 'ingest', columns: ['price', 'log10', 'step'], rows: [
        ['£200,000', lg(200000), ''], ['£220,000', lg(220000), '+0.041'],
        ['£500,000', lg(500000), ''], ['£550,000', lg(550000), '+0.041'],
      ],
    },
    figurePlot('raw-hist', C(v1).find((c) => c.cell === 2)!.figure![0], { compact: true, xScale: 1000 }),
    { type: 'note', id: 'log-note', tone: 'store', text: 'Prices move in percentages, not pounds. On a log scale the bell is symmetric, and that will matter for the model in Course 9.' },
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
    (() => {
      const m = outputOf(C(v5), 9).table!
      const at = (a: string, b: string) => m.rows.find((r) => r[0] === a)![m.columns.indexOf(b) + 1]
      return {
        type: 'table' as const, id: 'pairs', title: 'other pairs (from §6.5)', tone: 'ingest' as const, columns: ['pair', 'r'], rows: [
          ['sqft, price', at('sqft', 'price')], ['beds, price', at('beds', 'price')], ['sqft, beds', at('sqft', 'beds')],
        ],
      }
    })(),
  ],
})

// §6.4 — comparing groups: median and the middle half per area, drawn as bars and lines.
const spread = outputOf(C(v4), 7).table!
export const seeGroups: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(v4), show: [7, 8], view: { 8: { yScale: 1000 } },
  side: [
    {
      type: 'table', id: 'iqr', title: 'the middle half, per area (£k)', tone: 'ingest', columns: ['area', '25%', 'median', '75%'],
      rows: spread.rows.map((row) => ({ cells: [row[0], ...row.slice(1).map((v) => String(Math.round(Number(v) / 1000)))], tone: ['Eastfield', 'Riverside'].includes(row[0]) ? 'store' as const : undefined })),
    },
    {
      type: 'table', id: 'q-words', title: 'reading a quantile', tone: 'ingest', columns: ['', 'of the area\'s sales cost less'], rows: [
        ['25%', 'a quarter'], ['median (50%)', 'half'], ['75%', 'three quarters'], ['75% − 25%', 'the IQR: how wide the middle half is'],
      ],
    },
    {
      type: 'note', id: 'overlap', tone: 'consume',
      text: `The middle halves overlap: a dearer Eastfield sale (75%: £${Math.round(Number(spread.rows[0][3]) / 1000)}k) costs more than a cheaper Riverside one (25%: £${Math.round(Number(spread.rows.at(-1)![1]) / 1000)}k). A median alone hides that.`,
    },
  ],
})

// §6.5 — correlation across every numeric column, and what it can and cannot see.
const withPrice = seriesOf(textOf(C(v5), 10))
export const seeCorr: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(v5), show: [9, 10],
  side: [
    {
      type: 'table', id: 'corr-bars', title: 'correlation with price', tone: 'ingest', columns: ['column', 'r', ''],
      rows: [...withPrice].reverse().map(([k, v]) => ({
        cells: [k, v, (Number(v) < 0 ? '◀' : '') + '█'.repeat(Math.round(Math.abs(Number(v)) * 12))],
        tone: Math.abs(Number(v)) > 0.5 ? 'store' as const : undefined,
      })),
    },
    (() => {
      const m = outputOf(C(v5), 9).table!
      return {
        type: 'table' as const, id: 'twins', title: 'two columns, one piece of information', tone: 'consume' as const, columns: ['pair', 'r'],
        rows: [['sqft, beds', m.rows.find((r) => r[0] === 'sqft')![m.columns.indexOf('beds') + 1]], ['sqft, price', m.rows.find((r) => r[0] === 'sqft')![m.columns.indexOf('price') + 1]], ['beds, price', m.rows.find((r) => r[0] === 'beds')![m.columns.indexOf('price') + 1]]],
      }
    })(),
    { type: 'note', id: 'corr-note', tone: 'consume', text: 'r measures a straight-line link between two columns, one pair at a time. built at 0.13 looks like "newer costs more": Course 7 shows why that is the area talking.' },
  ],
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
    figurePlot('from-zero', C(v6).find((c) => c.cell === 11)!.figure![0], { compact: true, yScale: 1000, tone: 'store' }),
    {
      type: 'table', id: 'truth', title: 'Riverside ÷ Eastfield (cell 13), median price', tone: 'store', columns: ['chart', 'bars look', 'really'], rows: [
        { cells: ['from zero', `${ratio}×`, `${ratio}×`], tone: 'store' },
        { cells: [`from £${floor / 1000}k`, `${looks.toFixed(1)}×`, `${ratio}×`], tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'rules', title: 'honest-chart rules', tone: 'ingest', columns: ['chart', 'rule'], rows: [
        ['bars', 'start at zero: length is the claim'],
        ['lines, scatter', 'may zoom: position is the claim'],
        ['any', 'label the axis, and its units'],
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
