import type { PlotSeries, SceneModel } from '@graphlearning/graphl-flow'
import { figurePlot, notebookFrame, num, outputOf, seriesOf, textOf, type Cell } from '../notebook'
import { tree } from '../tree'
import g1 from '../../../spine/model/01-baseline/cells.json'
import g2 from '../../../spine/model/02-line/cells.json'
import g3 from '../../../spine/model/03-least-squares/cells.json'
import g4 from '../../../spine/model/04-many/cells.json'
import g5 from '../../../spine/model/05-log/cells.json'
import g6 from '../../../spine/model/06-tree/cells.json'
import g7 from '../../../spine/model/07-boosting/cells.json'
import g8 from '../../../spine/model/08-overfitting/cells.json'
import generator from '../../../scripts/generate_data.py?raw'
import v1 from '../../../spine/see/01-distributions/cells.json'
import f2 from '../../../spine/features/02-split/cells.json'

// Course 9 — predict prices, in notebooks/model.ipynb. Every score is the kernel's (cells.json). §9.4
// is the reveal: the generator's hidden rule (scripts/generate_data.py, read here, never retyped)
// beside the coefficients the model found.
const FILE = 'notebooks/model.ipynb'
const NBS = ['explore.ipynb', 'select.ipynb', 'clean.ipynb', 'shape.ipynb', 'see.ipynb', 'stats.ipynb', 'model.ipynb']
const files = { active: FILE, notebooks: NBS, data: ['areas.csv', 'homes.csv', 'homes_clean.csv'] }
const C = (x: unknown) => x as Cell[]
const gbp = (n: number) => `${n < 0 ? '−' : ''}£${Math.abs(Math.round(n)).toLocaleString('en-GB')}`
const nums = (text: string) => [...text.replace(/np\.\w+\(/g, '').matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
const fig = (cells: Cell[], n: number) => cells.find((c) => c.cell === n)!.figure![0]
const baseline = num(textOf(C(g1), 14))

// §9.1 — the baseline: the same guess for every house.
export const modelBaseline: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(g1), show: [14],
  side: [
    {
      type: 'group', id: 'mae', title: 'mean absolute error (MAE)', icon: 'search', tone: 'ingest', children: [
        { type: 'item', id: 'mae-1', title: 'for each test house: |actual − predicted|', sub: 'how far off, in pounds', chip: true },
        { type: 'item', id: 'mae-2', title: 'average them', sub: 'the typical miss', chip: true },
      ],
    },
    {
      type: 'table', id: 'base', title: 'the baseline: guess the training median for every house', tone: 'consume', columns: ['', ''], rows: [
        ['prediction, every time', 'the median of y_train'],
        { cells: ['MAE on the test set', gbp(baseline)], tone: 'consume' },
      ],
    },
    (() => {
      const h = figurePlot('guess', fig(C(v1), 2), { compact: true, xScale: 1000, tone: 'ingest' })
      const g = nums(textOf(C(f2), 5))[0] / 1000
      return { ...h, title: 'every price (£k), and the one guess', series: [...h.series, { kind: 'segment' as const, from: [g, 0] as [number, number], to: [g, h.y.max!] as [number, number], label: 'the guess', tone: 'consume' as const, dashed: false }] }
    })(),
    { type: 'note', id: 'base-note', tone: 'store', text: 'Every model from here must beat this number, or it has learned nothing about houses.' },
  ],
  edges: [{ from: 'mae-1', to: 'mae-2' }],
})

// §9.2 — a straight line on size.
const [intercept, slope, lineMae] = nums(textOf(C(g2), 15))
export const modelLine: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(g2), show: [15],
  side: [
    { type: 'item', id: 'eq', title: `price ≈ ${gbp(intercept)} + ${gbp(slope).replace('.', '.')} × sqft`, sub: `£${slope} for every extra square foot`, icon: 'chart' },
    {
      type: 'table', id: 'vs', title: 'MAE on the test set', tone: 'store', columns: ['model', 'MAE'], rows: [
        { cells: ['median guess', gbp(baseline)], tone: 'consume' },
        { cells: ['line on sqft', gbp(lineMae)], tone: 'store' },
      ],
    },
    figurePlot('line-fig', fig(C(g2), 16), { compact: true, yScale: 1000 }),
    { type: 'note', id: 'line-note', tone: 'ingest', text: 'fit() chose the intercept and slope; predict() reads the line. Size alone halves the error.' },
  ],
})

// §9.3 — ◆ full scene: least squares. Errors, squared, averaged: the slope with the smallest wins.
const residuals = outputOf(C(g3), 17).table!
const curve = fig(C(g3), 18)
const errorPlot = (() => {
  const p = figurePlot('loss', curve, { tone: 'ingest' })
  const mark: PlotSeries = { kind: 'segment', from: [slope, p.y.min!], to: [slope, p.y.max!], label: `fit: ${slope}`, tone: 'store' }
  return { ...p, title: 'RMSE on the training rows, for each slope (£)', x: { ...p.x, label: '£ per sq ft' }, series: [...p.series, mark] }
})()
export const modelLeastSquares: SceneModel = {
  title: 'How least squares fits a line',
  sub: 'each house\'s error, squared, averaged: the line with the smallest wins',
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'steps', bare: true, children: [
        {
          type: 'group', id: 'ls1', badge: 1, title: 'An error per house', tone: 'ingest', icon: 'search', children: [
            { type: 'table', id: 'errs', columns: ['sqft', 'actual', 'line says', 'error'], rows: residuals.rows.map((r) => r.slice(1).map((v, i) => (i ? gbp(Number(v)) : v))) },
          ],
        },
        {
          type: 'group', id: 'ls2', badge: 2, title: 'Square them, average, root', tone: 'ingest', icon: 'layers', children: [
            { type: 'item', id: 'ls2-a', title: 'squaring: big misses count far more', sub: 'and a miss above cancels nothing below', chip: true },
            { type: 'item', id: 'ls2-b', title: 'RMSE = √ mean(error²)', sub: 'back in pounds', chip: true },
          ],
        },
        {
          type: 'group', id: 'ls3', badge: 3, title: 'Try every slope: keep the lowest', tone: 'store', icon: 'filter', children: [
            { type: 'item', id: 'ls3-a', title: `the bottom of the curve: £${slope} per sq ft`, sub: 'what LinearRegression found, without trying slopes', chip: true },
          ],
        },
      ],
    },
    errorPlot,
  ],
  edges: [{ from: 'ls1', to: 'ls2' }, { from: 'ls2', to: 'ls3' }],
}

// §9.4 — many features, and the reveal: the model recovers the rule the data was made with.
const coef = new Map(seriesOf(textOf(C(g4), 20)).map(([k, v]) => [k.replace(/^(numbers|area)__(area_)?/, ''), Number(v)]))
const linearMae = num(textOf(C(g4), 19))
const rule = {
  sqft: Number(/\+ (\d+) \* sqft/.exec(generator)![1]),
  garage: Number(/(\d[\d_]*) \* garage/.exec(generator)![1].replace('_', '')),
  condition: Number(/(\d[\d_]*) \* \(condition - 3\)/.exec(generator)![1].replace('_', '')),
  monthly: Number(/\* (1\.\d+) \*\* months/.exec(generator)![1]),
  premium: Object.fromEntries([...(/AREA_PREMIUM = \{([^}]*)\}/.exec(generator)![1]).matchAll(/'([^']+)': (-?[\d_]+)/g)].map((m) => [m[1], Number(m[2].replace('_', ''))])),
}
// The rule is in January-2021 pounds; the sales span 69 months. Midway, the market had risen by:
const mid = rule.monthly ** 34
const ruleRow = (name: string, value: number) => ({ cells: [name, gbp(coef.get(name)!), value ? gbp(value * mid) : '0 (not in the rule)'] })
export const modelMany: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(g4), show: [19, 20],
  side: [
    {
      type: 'table', id: 'reveal', title: 'what the model found, and the rule the data was made with', tone: 'store', columns: ['feature', 'model', `rule × ${mid.toFixed(2)}`],
      rows: [
        ruleRow('sqft', rule.sqft),
        ruleRow('garage', rule.garage),
        ruleRow('condition', rule.condition),
        ruleRow('built', 0),
        ruleRow('beds', 0),
        ...['Riverside', 'Old Town', 'Northgate', 'Hillcrest'].map((a) => ruleRow(a, rule.premium[a] - rule.premium.Eastfield)),
      ],
    },
    {
      type: 'table', id: 'rule-src', title: 'scripts/generate_data.py: the hidden rule', tone: 'ingest', columns: ['in the rule', ''], rows: [
        ['£ per sq ft (Jan 2021)', String(rule.sqft)],
        ['per garage space', gbp(rule.garage)],
        ['market', `× ${rule.monthly} a month`],
      ],
    },
    { type: 'note', id: 'reveal-note', tone: 'store', text: `MAE ${gbp(linearMae)}. built and beds come out near 0: the rule never used them. The model found that from the sales alone.` },
  ],
})

// §9.5 — a log target: tried, measured, and NOT kept. The idea from Course 6 did not pay here.
const [missLinear, missLog] = nums(textOf(C(g5), 21))
const thirds = outputOf(C(g5), 22).table!
export const modelLog: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(g5), show: [21, 22],
  side: [
    {
      type: 'table', id: 'miss', title: 'typical miss, as a share of the price', tone: 'ingest', columns: ['model', 'median miss'], rows: [
        { cells: ['linear on price', `${(missLinear * 100).toFixed(1)}%`], tone: 'store' },
        { cells: ['linear on log(price)', `${(missLog * 100).toFixed(1)}%`], tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'ttr', title: 'TransformedTargetRegressor', tone: 'ingest', columns: ['step', 'does'], rows: [
        ['fit', 'learns log(price) from X'],
        ['predict', 'exp() of its answer: back to £'],
      ],
    },
    {
      type: 'group', id: 'loop', title: 'an idea is a hypothesis', icon: 'workflow', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'lp-1', title: 'idea', sub: 'prices are skewed', chip: true },
        { type: 'item', id: 'lp-2', title: 'measure', sub: 'on the test set', chip: true },
        { type: 'item', id: 'lp-3', title: 'keep or drop', sub: 'here: drop', chip: true },
      ],
    },
    {
      type: 'table', id: 'thirds', title: 'median miss by price third (cell 22)', tone: 'ingest', columns: ['test houses', 'linear', 'log'],
      rows: thirds.rows.map((r) => ({ cells: [r[0], gbp(Number(r[1])), gbp(Number(r[2]))], tone: Number(r[2]) < Number(r[1]) ? 'store' as const : undefined })),
    },
    { type: 'note', id: 'log-note', tone: 'consume', text: `The log model only wins on the cheapest third (${thirds.rows[0][2]} vs ${thirds.rows[0][1]}). These prices are built additively, so a straight line in pounds fits them better.` },
  ],
  edges: [{ from: 'lp-1', to: 'lp-2' }, { from: 'lp-2', to: 'lp-3' }],
})

// §9.6 — a decision tree: questions, in order, ending in a price.
const treeMae = num(textOf(C(g6), 23))
const leaves = [...textOf(C(g6), 24, 'stream').matchAll(/value: \[(\d+)\]/g)].map((m) => Number(m[1]))
const splits = [...textOf(C(g6), 24, 'stream').matchAll(/\|--- numbers__sqft <= (\d+)/g)].map((m) => m[1])
export const modelTree: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(g6), show: [23, 24], view: { 24: { head: 12, tail: 3 } },
  side: [
    {
      type: 'group', id: 'questions', title: 'the first two questions', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'q-root', title: `sqft ≤ ${splits[0]}?`, chip: true },
        {
          type: 'group', id: 'q-kids', bare: true, dir: 'row', children: [
            { type: 'item', id: 'q-yes', title: `yes: sqft ≤ ${splits[1]}?`, sub: 'then: Riverside?', chip: true },
            { type: 'item', id: 'q-no', title: `no: sqft ≤ ${splits[2]}?`, sub: 'then: Riverside?', chip: true },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'leaves', title: `${leaves.length} leaves: the only ${leaves.length} prices it can say (MAE ${gbp(treeMae)})`, tone: 'store', columns: ['leaf', 'price', ''],
      rows: leaves.map((v, i) => [String(i + 1), gbp(v), '█'.repeat(Math.round(v / 40000))]),
    },
    { type: 'note', id: 'tree-note', tone: 'ingest', text: 'Size first, then Riverside: the tree found the two biggest effects on its own. But depth 3 means only 8 prices, so it misses more than the line.' },
  ],
  edges: [{ from: 'q-root', to: 'q-yes' }, { from: 'q-root', to: 'q-no' }],
})

// §9.7 — every model so far, on the same test set.
const board = seriesOf(textOf(C(g7), 25)).map(([k, v]) => [k, Number(v)] as [string, number])
const best = Math.min(...board.map(([, v]) => v))
export const modelBoosting: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(g7), show: [25],
  side: [
    {
      type: 'table', id: 'board', title: 'MAE on the test set (smaller is better)', tone: 'ingest', columns: ['model', 'MAE', ''],
      rows: board.map(([k, v]) => ({ cells: [k, gbp(v), '█'.repeat(Math.round(v / 4000))], tone: v === best ? 'store' as const : undefined })),
    },
    {
      type: 'group', id: 'boost', title: 'boosting, in one picture', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'bo-1', title: 'a small tree', sub: 'makes errors', chip: true },
        { type: 'item', id: 'bo-2', title: 'the next tree predicts those errors', sub: 'and corrects them, a little', chip: true },
        { type: 'item', id: 'bo-3', title: '…a hundred times', chip: true },
      ],
    },
    { type: 'note', id: 'board-note', tone: 'store', text: 'The plain linear model wins here. Boosting is powerful; it is not magic. When the truth is close to a straight line, a line is hard to beat.' },
  ],
  edges: [{ from: 'bo-1', to: 'bo-2' }, { from: 'bo-2', to: 'bo-3' }],
})

// §9.8 — overfitting: deeper trees fit the training rows better and the test rows worse.
const depthRows = outputOf(C(g8), 26).table!
const bestDepth = depthRows.rows.reduce((a, r) => (Number(r[2]) < Number(a[2]) ? r : a))
const deepest = depthRows.rows.at(-1)!
export const modelOverfitting: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(g8), show: [26],
  side: [
    {
      type: 'table', id: 'depths', title: 'MAE by depth', tone: 'ingest', columns: ['depth', 'train', 'test'],
      rows: depthRows.rows.map((r) => ({ cells: [r[0], gbp(Number(r[1])), gbp(Number(r[2]))], tone: r === bestDepth ? 'store' as const : r === deepest ? 'consume' as const : undefined })),
    },
    figurePlot('curves', fig(C(g8), 27), { compact: true, yScale: 1000 }),
    {
      type: 'table', id: 'zones', title: 'reading the two curves', tone: 'store', columns: ['depth', 'the tree'], rows: [
        [`1–${depthRows.rows[1][0]}`, 'too simple: misses on both'],
        [`about ${bestDepth[0]}`, 'best on unseen houses'],
        [deepest[0], `memorised: ${gbp(Number(deepest[1]))} off on train`],
      ],
    },
  ],
})

export const modelScenes: Record<string, SceneModel> = {
  'model-baseline': modelBaseline,
  'model-line': modelLine,
  'model-least-squares': modelLeastSquares,
  'model-many': modelMany,
  'model-log': modelLog,
  'model-tree': modelTree,
  'model-boosting': modelBoosting,
  'model-overfitting': modelOverfitting,
}
