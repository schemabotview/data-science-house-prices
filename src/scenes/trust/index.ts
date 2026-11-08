import type { SceneModel } from '@graphlearning/graphl-flow'
import { SIDE_PLOT_W } from '../grid'
import { figurePlot, notebookFrame, num, outputOf, seriesOf, textOf, type Cell } from '../notebook'
import { tree } from '../tree'
import t1 from '../../../spine/trust/01-cv/cells.json'
import t2 from '../../../spine/trust/02-tuning/cells.json'
import t3 from '../../../spine/trust/03-residuals/cells.json'
import t4 from '../../../spine/trust/04-importance/cells.json'
import t5 from '../../../spine/trust/05-intervals/cells.json'
import t6 from '../../../spine/trust/06-limits/cells.json'
import t7 from '../../../spine/trust/07-reproducible/cells.json'

// Course 10 — validate and explain, the end of notebooks/model.ipynb. Every number is the kernel's.
const FILE = 'notebooks/model.ipynb'
const NBS = ['explore.ipynb', 'select.ipynb', 'clean.ipynb', 'shape.ipynb', 'see.ipynb', 'stats.ipynb', 'model.ipynb']
const files = { active: FILE, notebooks: NBS, data: ['areas.csv', 'homes.csv', 'homes_clean.csv'] }
const C = (x: unknown) => x as Cell[]
const gbp = (n: number) => `${n < 0 ? '−' : ''}£${Math.abs(Math.round(n)).toLocaleString('en-GB')}`
const nums = (text: string) => [...text.replace(/np\.\w+\(/g, '').matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
const fig = (cells: Cell[], n: number) => cells.find((c) => c.cell === n)!.figure![0]
const bar = (v: number, per: number) => '█'.repeat(Math.max(0, Math.round(v / per)))

// §10.1 — cross-validation: five exams from the training rows, the test set still untouched.
const cv = nums(textOf(C(t1), 28))
const folds = cv.slice(0, 5), [cvMean, cvStd] = cv.slice(5)
export const trustCv: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(t1), show: [28],
  side: [
    {
      type: 'table', id: 'folds', title: 'KFold(5): each fifth takes a turn as the exam', tone: 'ingest', columns: ['fold', 'trained on', 'MAE on the fifth'],
      rows: folds.map((v, i) => ({ cells: [String(i + 1), 'the other 4/5', gbp(v)] })),
    },
    {
      type: 'plot', id: 'fold-plot', compact: true, w: SIDE_PLOT_W, title: `MAE per fold (£k): mean ${gbp(cvMean)} ± ${gbp(cvStd)}`, tone: 'ingest',
      x: { labels: folds.map((_, i) => `fold ${i + 1}`) }, y: { min: 0, max: 25, step: 5 },
      series: [
        { kind: 'bar', points: folds.map((v, i) => [i, Math.round(v / 100) / 10]) },
        { kind: 'segment', from: [-0.5, cvMean / 1000], to: [4.5, cvMean / 1000], label: 'mean', tone: 'store', dashed: false },
      ],
    },
  ],
})

// §10.2 — tuning: a grid of settings, judged by cross-validation; then the test set, once.
const top = outputOf(C(t2), 30).table!
const [bestCv, linearCv, bestTest, linearTest] = nums(textOf(C(t2), 31))
export const trustTuning: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(t2), show: [29, 30, 31], view: { 30: { show: [[1, 1], [7, 7]] } },
  side: [
    {
      type: 'table', id: 'verdict', title: 'tuned boosting against the linear model', tone: 'store', columns: ['', 'CV MAE', 'test MAE'], rows: [
        ['boosting, tuned', gbp(bestCv), gbp(bestTest)],
        { cells: ['linear', gbp(linearCv), gbp(linearTest)], tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'flow', title: 'GridSearchCV', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'gs-1', title: '3 × 3 settings', sub: '× 5 folds = 45 fits, on the training rows only', icon: 'layers' },
        { type: 'item', id: 'gs-2', title: `best by CV: rate ${top.rows[0][1]}, ${top.rows[0][2]} leaves`, sub: `CV MAE ${gbp(Number(top.rows[0][3]))}`, icon: 'search' },
        { type: 'item', id: 'gs-3', title: 'then the test set, once', sub: 'the linear model still wins', icon: 'lock', tone: 'store' },
      ],
    },
  ],
  edges: [{ from: 'gs-1', to: 'gs-2' }, { from: 'gs-2', to: 'gs-3' }],
})

// §10.3 — where it is wrong: errors by area, and their shape.
const byArea = outputOf(C(t3), 32).table!
const worst = byArea.rows.reduce((a, r) => (Math.abs(Number(r[1])) > Math.abs(Number(a[1])) ? r : a))
export const trustResiduals: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(t3), show: [32],
  side: [
    {
      type: 'table', id: 'bias', title: 'median error by area (+ = sold above the prediction)', tone: 'ingest', columns: ['area', 'error', ''],
      rows: byArea.rows.map((r) => ({ cells: [r[0], gbp(Number(r[1])), (Number(r[1]) < 0 ? '◀' : '') + bar(Math.abs(Number(r[1])), 1000)], tone: r === worst ? 'consume' as const : undefined })),
    },
    figurePlot('res-hist', fig(C(t3), 33), { compact: true, w: SIDE_PLOT_W, xStep: 50, xScale: 1000 }),
  ],
})

// §10.4 — what it uses: shuffle one column at a time and measure the damage.
const imp = seriesOf(textOf(C(t4), 34)).map(([k, v]) => [k, Number(v)] as [string, number]).reverse()
export const trustImportance: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(t4), show: [34],
  side: [
    {
      type: 'table', id: 'imp', title: 'MAE added when a column is shuffled', tone: 'store', columns: ['column', '+ MAE', ''],
      rows: imp.map(([k, v]) => ({ cells: [k, gbp(v), bar(v, 2500)], tone: v > 5000 ? 'store' as const : undefined })),
    },
    {
      type: 'group', id: 'how', title: 'permutation importance', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'h1', title: 'shuffle one column of X_test', sub: 'its link to price is broken', chip: true },
        { type: 'item', id: 'h2', title: 'score again: how much worse?', sub: '20 shuffles, averaged', chip: true },
      ],
    },
  ],
  edges: [{ from: 'h1', to: 'h2' }],
})

// §10.5 — an interval, not a number; and checking whether an interval keeps its promise.
const house = outputOf(C(t5), 35).table!
const q = nums(textOf(C(t5), 36))
const [q10, q50, q90, actual] = [q[1], q[3], q[5], q[6]]
const coverageQ = num(textOf(C(t5), 37))
const [below, above, coverageCv] = nums(textOf(C(t5), 38))
export const trustIntervals: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(t5), show: [36, 37, 38],
  side: [
    {
      type: 'table', id: 'coverage', title: 'an 80% interval should hold 80% of test prices', tone: 'store', columns: ['interval', 'held'], rows: [
        { cells: ['quantile boosting, 10–90%', `${(coverageQ * 100).toFixed(1)}%`], tone: 'consume' },
        { cells: [`linear ${gbp(below)} / +${gbp(above)}`, `${(coverageCv * 100).toFixed(1)}%`], tone: 'store' },
      ],
    },
    {
      type: 'plot', id: 'band', compact: true, w: SIDE_PLOT_W, title: `one test house: ${house.rows[0][1]} sq ft, ${house.rows[0][6]} (£k)`, tone: 'ingest', grid: false,
      x: { min: 245, max: 340, step: 10 }, y: { min: 0, max: 2, step: 1 },
      series: [
        { kind: 'segment', from: [q10 / 1000, 0.5], to: [q90 / 1000, 0.5], label: '10–90%', tone: 'ingest', dashed: false },
        { kind: 'scatter', points: [[q50 / 1000, 1]], label: 'median', tone: 'store' },
        { kind: 'scatter', points: [[actual / 1000, 1.5]], label: 'sold', tone: 'consume' },
      ],
    },
  ],
})

// §10.6 — when not to trust it: far outside the training data, and an area it never saw.
const [maxSqft, castleLine, castleTrees] = nums(textOf(C(t6), 39))
const unknown = outputOf(C(t6), 40, 'error')
export const trustLimits: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(t6), show: [39, 40],
  side: [
    {
      type: 'table', id: 'castle', title: 'a 12,000 sq ft castle', tone: 'consume', columns: ['', ''], rows: [
        ['largest house in training', `${maxSqft.toLocaleString('en-GB')} sq ft`],
        ['the line: keeps going', gbp(castleLine)],
        ['boosted trees: flatten out', gbp(castleTrees)],
      ],
    },
    {
      type: 'group', id: 'zones', title: 'inside the data, and outside it', icon: 'search', tone: 'ingest', children: [
        { type: 'item', id: 'z-in', title: 'inside', sub: 'like the sales it learned from: trust it, within the interval', icon: 'check', tone: 'store' },
        { type: 'item', id: 'z-out', title: 'outside', sub: 'two models, two wild answers: refuse to price it', icon: 'zap', tone: 'consume' },
        { type: 'item', id: 'z-new', title: `an area it never saw: ${unknown.ename}`, sub: 'fails loudly, which is the right behaviour', icon: 'search' },
      ],
    },
  ],
})

// §10.7 — reproducible: pins, seeds, and the notebook re-run top to bottom by the spine.
const versions = [...textOf(C(t7), 41).matchAll(/'([^']+)': '([^']+)'/g)].map((m) => [m[1], m[2]])
const again = num(textOf(C(t7), 42))
export const trustReproducible: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(t7), show: [41, 42],
  side: [
    {
      type: 'table', id: 'seeds', title: 'every random step, seeded', tone: 'store', columns: ['step', 'random_state'], rows: [
        ['train_test_split', '1460'],
        ['KFold', '1460'],
        ['trees, boosting', '1460'],
        ['importance', '1460'],
      ],
    },
    {
      type: 'group', id: 'clean-run', title: 'a clean run, every change', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'cr-1', title: 'restart the kernel', sub: `pinned: ${versions.slice(0, 3).map(([k, v]) => `${k} ${v}`).join(', ')}`, icon: 'power' },
        { type: 'item', id: 'cr-2', title: 'run all, top to bottom', sub: 'no cell depends on an order you remember', icon: 'workflow' },
        { type: 'item', id: 'cr-3', title: `the same numbers: test MAE ${gbp(again)}`, sub: 'on another machine, next year', icon: 'check', tone: 'store' },
      ],
    },
  ],
  edges: [{ from: 'cr-1', to: 'cr-2' }, { from: 'cr-2', to: 'cr-3' }],
})

export const trustScenes: Record<string, SceneModel> = {
  'trust-cv': trustCv,
  'trust-tuning': trustTuning,
  'trust-residuals': trustResiduals,
  'trust-importance': trustImportance,
  'trust-intervals': trustIntervals,
  'trust-limits': trustLimits,
  'trust-reproducible': trustReproducible,
}
