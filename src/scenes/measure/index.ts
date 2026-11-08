import type { PlotSeries, SceneModel } from '@graphlearning/graphl-flow'
import { SIDE_PLOT_W } from '../grid'
import { figurePlot, notebookFrame, num, outputOf, seriesOf, textOf, type Cell } from '../notebook'
import { tree } from '../tree'
import m1 from '../../../spine/measure/01-centre/cells.json'
import m2 from '../../../spine/measure/02-samples/cells.json'
import m4 from '../../../spine/measure/04-bootstrap/cells.json'
import m5 from '../../../spine/measure/05-permutation/cells.json'
import m6 from '../../../spine/measure/06-p-values/cells.json'
import m7 from '../../../spine/measure/07-confounder/cells.json'
import v1 from '../../../spine/see/01-distributions/cells.json'

// Course 7 — how sure are we, in notebooks/stats.ipynb. Every random draw is seeded, so every number
// below replays; each is read from cells.json.
const FILE = 'notebooks/stats.ipynb'
const NBS = ['explore.ipynb', 'select.ipynb', 'clean.ipynb', 'shape.ipynb', 'see.ipynb', 'stats.ipynb']
const files = { active: FILE, notebooks: NBS, data: ['areas.csv', 'homes.csv', 'homes_clean.csv'] }
const C = (x: unknown) => x as Cell[]
const gbp = (n: number) => `${n < 0 ? '−' : ''}£${Math.abs(Math.round(n)).toLocaleString('en-GB')}`
const nums = (text: string) => [...text.replace(/np\.\w+\(/g, '').matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
const fig = (cells: Cell[], n: number) => cells.find((c) => c.cell === n)!.figure![0]

// §7.1 — centre and spread, and what one extreme sale does to each.
const robust = outputOf(C(m1), 3).table!
const row = (k: string) => robust.rows.find((r) => r[0] === k)!.slice(1).map(Number)
export const measureCentre: SceneModel = notebookFrame({
  tree: tree({ ...files, fresh: [FILE] }), file: FILE, cells: C(m1),
  side: [
    {
      type: 'table', id: 'shift', title: 'add one £5m sale to 1,453', tone: 'ingest', columns: ['', 'as sold', '+ £5m', 'moves'],
      rows: ['mean', 'median', 'std'].map((k) => {
        const [a, b] = row(k)
        return { cells: [k, gbp(a), gbp(b), gbp(b - a)], tone: k === 'median' ? 'store' as const : 'consume' as const }
      }),
    },
    (() => {
      const h = figurePlot('centres', fig(C(v1), 2), { compact: true, w: SIDE_PLOT_W, xScale: 1000, tone: 'ingest' })
      const top = h.y.max!
      const [mean, median] = [row('mean')[0], row('median')[0]].map((v) => v / 1000)
      return { ...h, title: 'prices (£k), from Course 6', series: [...h.series,
        { kind: 'segment' as const, from: [median, 0] as [number, number], to: [median, top] as [number, number], label: 'median', tone: 'store' as const, dashed: false },
        { kind: 'segment' as const, from: [mean, 0] as [number, number], to: [mean, top * 0.7] as [number, number], label: 'mean', tone: 'consume' as const, dashed: false },
      ] }
    })(),
  ],
})

// §7.2 — a sample of 100 is off; how far off, measured over 1,000 samples.
const [oneSample, everyone] = nums(textOf(C(m2), 4))
const spread = new Map(seriesOf(textOf(C(m2), 5)))
export const measureSamples: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(m2), show: [4, 5],
  side: [
    {
      type: 'table', id: 'thousand', title: 'the median: one sample, all, and 1,000 samples', tone: 'store', columns: ['', ''],
      rows: [['one sample of 100', gbp(oneSample)], ['all 1,453 sales', gbp(everyone)], ['middle (50%)', gbp(Number(spread.get('50%')))], ['typical miss (std)', gbp(Number(spread.get('std')))], ['range', `${gbp(Number(spread.get('min')))} – ${gbp(Number(spread.get('max')))}`]],
    },
    figurePlot('sampling', fig(C(m2), 6), { compact: true, w: SIDE_PLOT_W, xStep: 10, xScale: 1000, tone: 'store' }),
  ],
})

// §7.3 — ◆ full scene: the bootstrap, step by step, on Riverside's real sales.
const [nRiver, riverMedian] = nums(textOf(C(m4), 7))
const ci = seriesOf(textOf(C(m4), 8)).map(([, v]) => Number(v))
const sci = nums(textOf(C(m4), 10))
const bootPlot = (id: string, compact: boolean) => {
  const p = figurePlot(id, fig(C(m4), 9), { compact, w: compact ? SIDE_PLOT_W : undefined, xScale: 1000, tone: 'store' })
  const top = p.y.max!
  const marks: PlotSeries[] = ci.map((v, i) => ({ kind: 'segment', from: [v / 1000, 0], to: [v / 1000, top], label: i ? '97.5%' : '2.5%', tone: 'consume' }))
  return { ...p, series: [...p.series, ...marks] }
}
export const measureBootstrapScene: SceneModel = {
  title: 'The bootstrap',
  sub: `how sure is Riverside's median, from its ${nRiver} sales alone?`,
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'steps', bare: true, children: [
        { type: 'group', id: 'b1', badge: 1, title: `One sample: Riverside's ${nRiver} sales`, tone: 'ingest', icon: 'table', children: [{ type: 'item', id: 'b1-m', title: `median ${gbp(riverMedian)}`, chip: true }] },
        { type: 'group', id: 'b2', badge: 2, title: `Draw ${nRiver} from them, WITH replacement`, sub: 'some sales twice, some not at all', tone: 'ingest', icon: 'layers', children: [{ type: 'item', id: 'b2-m', title: 'a new median, a little different', chip: true }] },
        { type: 'group', id: 'b3', badge: 3, title: 'Repeat 2,000 times', tone: 'ingest', icon: 'clock', children: [{ type: 'item', id: 'b3-m', title: '2,000 medians: the histogram', chip: true }] },
        { type: 'group', id: 'b4', badge: 4, title: 'Keep the middle 95%', tone: 'store', icon: 'filter', children: [{ type: 'item', id: 'b4-m', title: `${gbp(ci[0])} – ${gbp(ci[1])}`, chip: true }] },
      ],
    },
    {
      type: 'group', id: 'result', bare: true, children: [
        bootPlot('boot', false),
        {
          type: 'table', id: 'agree', title: 'by hand, and by scipy.stats.bootstrap', tone: 'store', columns: ['', '2.5%', '97.5%'], rows: [
            ['pandas loop, 2,000 resamples', gbp(ci[0]), gbp(ci[1])],
            ['scipy, 2,000 resamples', gbp(sci[0]), gbp(sci[1])],
          ],
        },
      ],
    },
  ],
  edges: [{ from: 'b1', to: 'b2' }, { from: 'b2', to: 'b3' }, { from: 'b3', to: 'b4' }],
}

// §7.4 — a confidence interval for Riverside's median, two ways.
export const measureInterval: SceneModel = notebookFrame({
  tree: tree(files).map((e) => (e.name === 'pyproject.toml' ? { ...e, state: 'new' as const, note: '+ scipy' } : e)),
  file: FILE, cells: C(m4), show: [7, 8, 10],
  side: [
    bootPlot('ci-plot', true),
    {
      type: 'table', id: 'ci', title: "Riverside's median, with its 95% interval", tone: 'store', columns: ['', ''], rows: [
        ['median of 266 sales', gbp(riverMedian)],
        { cells: ['95% interval', `${gbp(ci[0])} – ${gbp(ci[1])}`], tone: 'store' },
        ['scipy agrees', `${gbp(sci[0])} – ${gbp(sci[1])}`],
      ],
    },
  ],
})

// §7.5 — does a garage add value? The observed gap against 5,000 shuffled ones.
const observed = num(textOf(C(m5), 11))
const p = num(textOf(C(m5), 12))
export const measurePermutation: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(m5), show: [11, 12],
  side: [
    {
      type: 'group', id: 'idea', title: 'if garages did not matter…', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'i1', title: 'shuffle who has a garage', sub: 'the prices stay put', chip: true },
        { type: 'item', id: 'i2', title: 'measure the median gap again', sub: 'a gap that luck alone produced', chip: true },
        { type: 'item', id: 'i3', title: '5,000 times: how often ≥ the real gap?', chip: true },
      ],
    },
    figurePlot('shuffles', fig(C(m5), 13), { compact: true, w: SIDE_PLOT_W, xScale: 1000, tone: 'ingest' }),
  ],
  edges: [{ from: 'i1', to: 'i2' }, { from: 'i2', to: 'i3' }],
})


// §7.6 — p-values, plainly: the same question, on all the data and on 40 sales.
const [fewGap, fewP] = nums(textOf(C(m6), 15))
export const measurePValues: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(m6), show: [14, 15],
  side: [
    {
      type: 'table', id: 'two-tests', title: 'one question, two amounts of data', tone: 'ingest', columns: ['data', 'gap', 'p'], rows: [
        { cells: ['all 1,453 sales', gbp(observed), p.toFixed(4)], tone: 'store' },
        { cells: ['40 sales', gbp(fewGap), fewP.toFixed(2)], tone: 'consume' },
      ],
    },
    {
      type: 'group', id: 'moves', title: 'what makes p small', icon: 'search', tone: 'ingest', children: [
        {
          type: 'group', id: 'mv-causes', bare: true, dir: 'row', children: [
            { type: 'item', id: 'mv-gap', title: 'a bigger gap', sub: 'a stronger effect', chip: true },
            { type: 'item', id: 'mv-data', title: 'more data', sub: '1,453 sales, not 40', chip: true },
          ],
        },
        { type: 'item', id: 'mv-p', title: 'a smaller p', sub: 'either one alone can do it', chip: true },
        { type: 'item', id: 'mv-not', title: `p = ${p.toFixed(4)} is not "the chance garages do not matter"`, sub: 'it is how often shuffled data made a gap this big', icon: 'search', tone: 'consume' },
      ],
    },
  ],
  edges: [{ from: 'mv-gap', to: 'mv-p' }, { from: 'mv-data', to: 'mv-p' }, { from: 'mv-p', to: 'mv-not' }],
})

// §7.7 — correlation is not causation: built "matters" overall, and not at all within an area.
const overall = num(textOf(C(m7), 16))
const builtByArea = seriesOf(textOf(C(m7), 17))
const within = [...textOf(C(m7), 18).matchAll(/'([^']+)': np\.float64\((-?[\d.]+)\)/g)].map((m) => [m[1], m[2]])
export const measureConfounder: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(m7), show: [16, 17, 18],
  side: [
    {
      type: 'group', id: 'dag', title: 'the area drives both', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'd-area', title: 'area', sub: 'where the house is', chip: true },
        {
          type: 'group', id: 'd-both', bare: true, dir: 'row', children: [
            { type: 'item', id: 'd-built', title: 'built', sub: 'newer estates in dear areas', chip: true },
            { type: 'item', id: 'd-price', title: 'price', sub: 'dearer areas', chip: true },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'within', title: 'built vs price: corr', tone: 'store', columns: ['where', 'r', 'median built'],
      rows: [
        { cells: ['all of Millbrook', String(overall), ''], tone: 'consume' },
        ...within.map(([a, r]) => ({ cells: [`inside ${a}`, r, builtByArea.find(([x]) => x === a)![1].replace('.0', '')] })),
      ],
    },
  ],
  edges: [{ from: 'd-area', to: 'd-built' }, { from: 'd-area', to: 'd-price' }],
})

export const measureScenes: Record<string, SceneModel> = {
  'measure-centre': measureCentre,
  'measure-samples': measureSamples,
  'measure-bootstrap': measureBootstrapScene,
  'measure-interval': measureInterval,
  'measure-permutation': measurePermutation,
  'measure-p-values': measurePValues,
  'measure-confounder': measureConfounder,
}
