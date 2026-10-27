import type { SceneModel } from '@graphlearning/graphl-flow'
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
      type: 'table', id: 'summary', title: 'the estimate, with its wobble', tone: 'store', columns: ['', ''], rows: [
        { cells: ['mean of 5 folds', gbp(cvMean)], tone: 'store' },
        ['spread (std)', gbp(cvStd)],
      ],
    },
    {
      type: 'plot', id: 'fold-plot', compact: true, title: 'MAE per fold (£k)', tone: 'ingest',
      x: { labels: folds.map((_, i) => `fold ${i + 1}`) }, y: { min: 0, max: 25, step: 5 },
      series: [
        { kind: 'bar', points: folds.map((v, i) => [i, Math.round(v / 100) / 10]) },
        { kind: 'segment', from: [-0.5, cvMean / 1000], to: [4.5, cvMean / 1000], label: 'mean', tone: 'store', dashed: false },
      ],
    },
    { type: 'note', id: 'cv-note', tone: 'ingest', text: 'Every choice from here is made on these folds. The test set stays locked until the one final score.' },
  ],
})

// §10.2 — tuning: a grid of settings, judged by cross-validation; then the test set, once.
const top = outputOf(C(t2), 30).table!
const [bestCv, linearCv, bestTest, linearTest] = nums(textOf(C(t2), 31))
export const trustTuning: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(t2), show: [29, 30, 31],
  side: [
    {
      type: 'table', id: 'top4', title: 'the best 4 of 9 settings, by CV MAE', tone: 'ingest', columns: ['learning rate', 'leaves', 'CV MAE'],
      rows: top.rows.map((r, i) => ({ cells: [r[1], r[2], gbp(Number(r[3]))], tone: i === 0 ? 'store' as const : undefined })),
    },
    {
      type: 'table', id: 'verdict', title: 'tuned boosting against the linear model', tone: 'store', columns: ['', 'CV MAE', 'test MAE'], rows: [
        ['boosting, tuned', gbp(bestCv), gbp(bestTest)],
        { cells: ['linear', gbp(linearCv), gbp(linearTest)], tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'flow', title: 'GridSearchCV', icon: 'workflow', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'gs-1', title: '3 × 3 settings', sub: '× 5 folds = 45 fits', chip: true },
        { type: 'item', id: 'gs-2', title: 'best by CV', sub: 'training rows only', chip: true },
        { type: 'item', id: 'gs-3', title: 'test, once', chip: true },
      ],
    },
    { type: 'note', id: 'tune-note', tone: 'ingest', text: 'Tuning helped boosting, and the linear model still wins on both. The model to ship is the linear one. Choosing on CV is what keeps the test score honest.' },
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
    figurePlot('res-hist', fig(C(t3), 33), { compact: true, xScale: 1000 }),
    {
      type: 'table', id: 'two-ways', title: 'two questions about errors', tone: 'store', columns: ['measure', 'asks'], rows: [
        ['median error', 'is it biased one way?'],
        ['median miss', 'how far off, either way?'],
      ],
    },
    { type: 'note', id: 'res-note', tone: 'consume', text: `${worst[0]} sells about ${gbp(Number(worst[1]))} above the model. Small against its miss of ${gbp(Number(worst[2]))}, but worth watching.` },
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
    { type: 'note', id: 'imp-note', tone: 'ingest', text: 'built and beds add nothing: shuffling them costs nothing. That matches the rule from §9.4, found a second, independent way.' },
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
      type: 'table', id: 'house', title: `one test house: ${house.rows[0].slice(1, 3).join(' sq ft, ')} beds, ${house.rows[0][6]}`, tone: 'ingest', columns: ['', 'price'], rows: [
        ['10% quantile model', gbp(q10)], ['50%', gbp(q50)], ['90%', gbp(q90)],
        { cells: ['it sold for', gbp(actual)], tone: actual > q90 ? 'consume' as const : 'store' as const },
      ],
    },
    {
      type: 'table', id: 'coverage', title: 'an 80% interval should hold 80% of test prices', tone: 'store', columns: ['interval', 'held'], rows: [
        { cells: ['quantile boosting, 10–90%', `${(coverageQ * 100).toFixed(1)}%`], tone: 'consume' },
        { cells: [`linear ${gbp(below)} / +${gbp(above)}`, `${(coverageCv * 100).toFixed(1)}%`], tone: 'store' },
      ],
    },
    {
      type: 'plot', id: 'band', compact: true, title: 'the house, on a price line (£k)', tone: 'ingest', grid: false,
      x: { min: 245, max: 340, step: 10 }, y: { min: 0, max: 2, step: 1 },
      series: [
        { kind: 'segment', from: [q10 / 1000, 0.5], to: [q90 / 1000, 0.5], label: '10–90%', tone: 'ingest', dashed: false },
        { kind: 'scatter', points: [[q50 / 1000, 1]], label: 'median', tone: 'store' },
        { kind: 'scatter', points: [[actual / 1000, 1.5]], label: 'sold', tone: 'consume' },
      ],
    },
    { type: 'note', id: 'int-note', tone: 'store', text: "Check every interval's promise on the test set. The linear model plus its own cross-validated errors keeps it; that is the interval to ship." },
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
      type: 'plot', id: 'reach', compact: true, title: 'sq ft: what it learned from, and the castle', tone: 'ingest', grid: false,
      x: { min: 0, max: 13000, step: 3000 }, y: { min: 0, max: 2, step: 1 },
      series: [
        { kind: 'segment', from: [0, 1], to: [maxSqft, 1], label: 'the data', tone: 'store', dashed: false },
        { kind: 'scatter', points: [[12000, 1]], label: 'castle', tone: 'consume' },
      ],
    },
    {
      type: 'group', id: 'zones', title: 'inside the data, and outside it', icon: 'search', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'z-in', title: 'inside', sub: 'like the sales it learned from: trust, within the interval', chip: true },
        { type: 'item', id: 'z-out', title: 'outside', sub: 'two models, two wild answers: refuse', chip: true },
      ],
    },
    { type: 'note', id: 'lim-note', tone: 'store', text: `An unknown area fails loudly: ${unknown.ename}. That is the right behaviour: no answer beats a confident wrong one.` },
  ],
})

// §10.7 — reproducible: pins, seeds, and the notebook re-run top to bottom by the spine.
const versions = [...textOf(C(t7), 41).matchAll(/'([^']+)': '([^']+)'/g)].map((m) => [m[1], m[2]])
const again = num(textOf(C(t7), 42))
export const trustReproducible: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(t7), show: [41, 42],
  side: [
    { type: 'table', id: 'pins', title: 'pinned (pyproject.toml)', tone: 'ingest', columns: ['tool', 'version'], rows: versions },
    {
      type: 'table', id: 'seeds', title: 'every random step, seeded', tone: 'store', columns: ['step', 'seed'], rows: [
        ['train_test_split', 'random_state=1460'],
        ['KFold', 'random_state=1460'],
        ['trees, boosting, importance', 'random_state=1460'],
      ],
    },
    {
      type: 'group', id: 'clean-run', title: 'a clean run, every change', icon: 'workflow', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'cr-1', title: 'restart kernel', chip: true },
        { type: 'item', id: 'cr-2', title: 'run all, top to bottom', chip: true },
        { type: 'item', id: 'cr-3', title: 'same numbers', chip: true },
      ],
    },
    { type: 'note', id: 'rep-note', tone: 'store', text: `Restart & Run All, on another machine, next year: the test MAE is ${gbp(again)} again. That is what makes a result something others can check.` },
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
