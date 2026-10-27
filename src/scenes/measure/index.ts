import type { PlotSeries, SceneModel } from '@graphlearning/graphl-flow'
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
const gbp = (n: number) => `£${Math.round(n).toLocaleString('en-GB')}`
const nums = (text: string) => [...text.replace(/np\.\w+\(/g, '').matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
const fig = (cells: Cell[], n: number) => cells.find((c) => c.cell === n)!.figure![0]

// §7.1 — centre and spread, and what one extreme sale does to each.
const robust = outputOf(C(m1), 3).table!
const iqr = num(textOf(C(m1), 2))
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
      const h = figurePlot('centres', fig(C(v1), 2), { compact: true, xScale: 1000, tone: 'ingest' })
      const top = h.y.max!
      const [mean, median] = [row('mean')[0], row('median')[0]].map((v) => v / 1000)
      return { ...h, title: 'prices (£k), from Course 6', series: [...h.series,
        { kind: 'segment' as const, from: [median, 0] as [number, number], to: [median, top] as [number, number], label: 'median', tone: 'store' as const, dashed: false },
        { kind: 'segment' as const, from: [mean, 0] as [number, number], to: [mean, top * 0.7] as [number, number], label: 'mean', tone: 'consume' as const, dashed: false },
      ] }
    })(),
    {
      type: 'table', id: 'spreads', title: 'two spreads', tone: 'ingest', columns: ['measure', 'value', 'one extreme sale'], rows: [
        ['std', gbp(row('std')[0]), 'jumps'],
        { cells: ['IQR (75% − 25%)', gbp(iqr), 'barely moves'], tone: 'store' },
      ],
    },
    { type: 'note', id: 'centre-note', tone: 'store', text: 'The median and the IQR are robust: they describe the typical sale, whatever one mansion costs.' },
  ],
})

// §7.2 — a sample of 100 is off; how far off, measured over 1,000 samples.
const [oneSample, everyone] = nums(textOf(C(m2), 4))
const spread = new Map(seriesOf(textOf(C(m2), 5)))
export const measureSamples: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(m2), show: [4, 5],
  side: [
    {
      type: 'table', id: 'one', title: 'one sample of 100 against all 1,453', tone: 'ingest', columns: ['', 'median'], rows: [
        ['sample (random_state=1)', gbp(oneSample)],
        { cells: ['every sale', gbp(everyone)], tone: 'store' },
        { cells: ['off by', gbp(everyone - oneSample)], tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'thousand', title: '1,000 samples of 100: their medians', tone: 'store', columns: ['', ''],
      rows: [['middle (50%)', gbp(Number(spread.get('50%')))], ['typical miss (std)', gbp(Number(spread.get('std')))], ['range', `${gbp(Number(spread.get('min')))} – ${gbp(Number(spread.get('max')))}`]],
    },
    figurePlot('sampling', fig(C(m2), 6), { compact: true, xScale: 1000, tone: 'store' }),
    { type: 'note', id: 'samples-note', tone: 'ingest', text: 'Every sample gives a different answer. The spread of those answers is how sure one sample can make you.' },
  ],
})

// §7.3 — ◆ full scene: the bootstrap, step by step, on Riverside's real sales.
const [nRiver, riverMedian] = nums(textOf(C(m4), 7))
const ci = seriesOf(textOf(C(m4), 8)).map(([, v]) => Number(v))
const sci = nums(textOf(C(m4), 10))
const bootPlot = (id: string, compact: boolean) => {
  const p = figurePlot(id, fig(C(m4), 9), { compact, xScale: 1000, tone: 'store' })
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
    { type: 'note', id: 'ci-note', tone: 'ingest', text: `Say "about £${Math.round(riverMedian / 1000)}k, likely between £${Math.round(ci[0] / 1000)}k and £${Math.round(ci[1] / 1000)}k". The interval is the honest part of the answer.` },
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
    {
      type: 'table', id: 'test', title: 'the test', tone: 'store', columns: ['', ''], rows: [
        ['real gap (garage − none)', gbp(observed)],
        { cells: ['shuffles at least as far out', `${(p * 100).toFixed(2)}%`], tone: 'store' },
      ],
    },
    figurePlot('shuffles', fig(C(m5), 13), { compact: true, xScale: 1000, tone: 'ingest' }),
  ],
  edges: [{ from: 'i1', to: 'i2' }, { from: 'i2', to: 'i3' }],
})


// §7.6 — p-values, plainly: the same question, on all the data and on 40 sales.
const share = num(textOf(C(m6), 14))
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
      type: 'table', id: 'says', title: `p = ${p.toFixed(4)}`, tone: 'store', columns: ['says', 'does not say'], rows: [
        ['luck rarely gives this gap', 'how big it is'],
        ['the gap is probably real', 'what causes it'],
        ['', 'whether it matters'],
        { cells: ['size, measured apart:', `${(share * 100).toFixed(1)}% of the median`], tone: 'ingest' },
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
      ],
    },
    { type: 'note', id: 'p-note', tone: 'consume', text: `With 40 sales, p is ${fewP.toFixed(2)}: no evidence. Not evidence of no effect: the garage effect is the same, the data was too small to see it.` },
  ],
  edges: [{ from: 'mv-gap', to: 'mv-p' }, { from: 'mv-data', to: 'mv-p' }],
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
    { type: 'note', id: 'conf-note', tone: 'store', text: 'Hold the confounder fixed and the link disappears. Compare like with like: same area, then ask about built.' },
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
