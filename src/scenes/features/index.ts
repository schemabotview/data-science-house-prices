import type { SceneModel } from '@graphlearning/graphl-flow'
import { notebookFrame, outputOf, textOf, type Cell } from '../notebook'
import { tree } from '../tree'
import f1 from '../../../spine/features/01-target/cells.json'
import f2 from '../../../spine/features/02-split/cells.json'
import f3 from '../../../spine/features/03-leakage/cells.json'
import f4 from '../../../spine/features/04-encoding/cells.json'
import f5 from '../../../spine/features/05-scaling/cells.json'
import f6 from '../../../spine/features/06-pipeline/cells.json'

// Course 8 — from columns to model inputs, in notebooks/model.ipynb (it carries Courses 8–10).
// Every number is the kernel's (cells.json).
const FILE = 'notebooks/model.ipynb'
const NBS = ['explore.ipynb', 'select.ipynb', 'clean.ipynb', 'shape.ipynb', 'see.ipynb', 'stats.ipynb', 'model.ipynb']
const files = { active: FILE, notebooks: NBS, data: ['areas.csv', 'homes.csv', 'homes_clean.csv'] }
const C = (x: unknown) => x as Cell[]
const nums = (text: string) => [...text.replace(/np\.\w+\(/g, '').matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
const gbp = (n: number) => `${n < 0 ? '−' : ''}£${Math.abs(Math.round(n)).toLocaleString('en-GB')}`

// §8.1 — the target and the features: what the model sees, and what it must not.
const head = outputOf(C(f1), 3).table!
export const featuresTarget: SceneModel = notebookFrame({
  tree: tree({ ...files, fresh: [FILE] }).map((e) => (e.name === 'pyproject.toml' ? { ...e, state: 'new' as const, note: 'M' } : e)),
  file: FILE, cells: C(f1),
  side: [
    {
      type: 'group', id: 'xy', title: 'X → model → y', icon: 'workflow', tone: 'ingest', dir: 'row', children: [
        { type: 'table', id: 'X', title: `X: ${head.columns.length} features`, rows: head.columns.map((c) => ({ id: c, cells: [c] })) },
        { type: 'item', id: 'model', title: 'a model', sub: 'learns from X to y', icon: 'cpu', stack: true },
        { type: 'table', id: 'y', title: 'y: the target', tone: 'store', rows: [{ id: 'price', cells: ['price'] }] },
      ],
    },
    {
      type: 'table', id: 'left-out', title: 'left out on purpose', tone: 'consume', columns: ['column', 'why'], rows: [
        ['id', 'a label, not a property'],
        ['agent', 'who sold it, not what it is'],
        ['sold', 'kept as months since Jan 2021'],
        ['school, km', 'per area: area has them'],
        ['price', 'it is the answer'],
      ],
    },
  ],
  edges: [{ from: 'X', to: 'model' }, { from: 'model', to: 'y' }],
})

// §8.2 — the split: a test set the model never sees until the very end.
const [nTrain, nTest] = nums(textOf(C(f2), 4))
const [mTrain, mTest] = nums(textOf(C(f2), 5))
export const featuresSplit: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(f2), show: [4, 5],
  side: [
    {
      type: 'group', id: 'split', title: 'train_test_split(test_size=0.2)', icon: 'filter', tone: 'ingest', children: [
        { type: 'item', id: 's-all', title: `${(nTrain + nTest).toLocaleString('en-GB')} sales`, sub: 'shuffled with random_state=1460', chip: true },
        {
          type: 'group', id: 's-parts', bare: true, dir: 'row', children: [
            { type: 'item', id: 's-train', title: `train: ${nTrain.toLocaleString('en-GB')}`, sub: 'the model learns here', chip: true },
            { type: 'item', id: 's-test', title: `test: ${nTest}`, sub: 'locked until the end', chip: true },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'medians', title: 'the two parts look alike', tone: 'store', columns: ['', 'median price'], rows: [
        ['train', gbp(mTrain)], ['test', gbp(mTest)],
      ],
    },
    {
      type: 'table', id: 'roles', title: 'what each part is for', tone: 'ingest', columns: ['part', 'used to'], rows: [
        ['train', 'fit, compare, tune: as often as you like'],
        ['test', 'one final score, once, at the end'],
      ],
    },
    { type: 'note', id: 'split-note', tone: 'consume', text: 'Score a model on the rows it learned from and it looks better than it is. The test set is the only honest exam.' },
  ],
  edges: [{ from: 's-all', to: 's-train' }, { from: 's-all', to: 's-test' }],
})

// §8.3 — ◆ full scene: leakage. A feature built from the answer scores perfectly, and is useless.
const leakyScore = textOf(C(f3), 6)
const honestScore = textOf(C(f3), 7)
const leakySource = C(f3).find((c) => c.cell === 6)!.source!.split('\n').slice(2, 8).join('\n')
export const featuresLeakage: SceneModel = {
  title: 'Leakage',
  sub: 'a feature that contains the answer: a perfect score, and a model that cannot be used',
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'leak', badge: 1, title: 'The leaky feature', tone: 'consume', icon: 'zap', children: [
        { type: 'code', id: 'leak-code', filename: 'model.ipynb, cell 6', lang: 'python', code: leakySource, highlight: [4] },
        { type: 'item', id: 'leak-why', title: 'per_sqft = price ÷ sqft', sub: 'built from y, the thing to predict', icon: 'search' },
      ],
    },
    {
      type: 'group', id: 'scores', bare: true, children: [
        {
          type: 'table', id: 'r2', title: 'R² on the TEST set (1.0 = perfect)', tone: 'ingest', columns: ['features', 'R²'], rows: [
            { cells: ['log sqft', String(honestScore)], tone: 'store' },
            { cells: ['log sqft + log per_sqft', String(leakyScore)], tone: 'consume' },
          ],
        },
        {
          type: 'group', id: 'unsold', badge: 2, title: 'Now value an unsold house', tone: 'store', icon: 'key', children: [
            { type: 'item', id: 'u-sqft', title: 'sqft: 1,500', sub: 'known', chip: true },
            { type: 'item', id: 'u-per', title: 'per_sqft: ?', sub: 'needs the price you are trying to find', chip: true },
          ],
        },
        {
          type: 'table', id: 'kinds', title: 'other ways the answer leaks in', tone: 'ingest', columns: ['leak', 'fix'], rows: [
            ['a scaler fitted on all rows', 'fit on train only (§8.5)'],
            ['the same sale in train and test', 'drop duplicates first (§4.5)'],
            ['a column filled in after the sale', 'ask: known at prediction time?'],
          ],
        },
      ],
    },
  ],
  edges: [{ from: 'leak', to: 'scores' }],
}

// §8.4 — encoding: one text column becomes five 0/1 columns.
const names = /array\(\[([\s\S]*?)\]/.exec(textOf(C(f4), 8))![1].match(/'[^']+'/g)!.map((s) => s.slice(1, -1))
const onehot = outputOf(C(f4), 9).table!
export const featuresEncoding: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(f4), show: [8, 9],
  side: [
    {
      type: 'table', id: 'onehot', title: 'one-hot: a 1 in its own column', tone: 'store', columns: ['area', ...names.map((n) => n.replace('area_', ''))],
      rows: onehot.rows.map((r) => ({ cells: [r[0], ...r.slice(1).map((v) => v.replace('.0', ''))] })),
    },
    {
      type: 'table', id: 'why-not', title: 'why not number the areas 1–5?', tone: 'consume', columns: ['as numbers', 'the model would read'], rows: [
        ['Eastfield = 1, Riverside = 5', 'Riverside is 5 × Eastfield'],
        ['Hillcrest = 2', 'between 1 and 3, in order'],
      ],
    },
    {
      type: 'table', id: 'options', title: 'the encoder, as used here', tone: 'ingest', columns: ['setting', 'means'], rows: [
        ['fit on X_train', 'learns the five areas'],
        ['handle_unknown="error"', 'a new area fails loudly'],
        ['sparse_output=False', 'a plain array'],
      ],
    },
    { type: 'note', id: 'enc-note', tone: 'store', text: `${names.length} areas become ${names.length} columns, each 0 or 1. No order, no distance: just "is it this area?"` },
  ],
})

// §8.5 — scaling: fitted on train, applied to test; so test is close to, not exactly, 0 and 1.
const [meanSqft, meanBuilt, sdSqft, sdBuilt] = nums(textOf(C(f5), 10))
const testScaled = outputOf(C(f5), 11).table!
export const featuresScaling: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(f5), show: [10, 11],
  side: [
    {
      type: 'group', id: 'fit-apply', title: 'fit on train, apply to both', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'fa-fit', title: '.fit(X_train)', sub: `learns: sqft ${meanSqft} ± ${sdSqft}, built ${meanBuilt} ± ${sdBuilt}`, chip: true },
        { type: 'item', id: 'fa-apply', title: '.transform(X_test)', sub: '(value − train mean) ÷ train std', chip: true },
      ],
    },
    {
      type: 'table', id: 'test-after', title: 'the TEST set, after scaling', tone: 'store', columns: ['', 'sqft', 'built'],
      rows: testScaled.rows.map((r) => ({ cells: r })),
    },
    {
      type: 'table', id: 'worked', title: 'one house, scaled by hand', tone: 'store', columns: ['', 'sqft'], rows: [
        ['value', '2,000'],
        ['− train mean', `− ${meanSqft}`],
        ['÷ train std', `÷ ${sdSqft}`],
        { cells: ['= scaled', ((2000 - meanSqft) / sdSqft).toFixed(2)], tone: 'store' },
      ],
    },
    { type: 'note', id: 'scale-note', tone: 'ingest', text: 'Not exactly 0 and 1 on test, and that is right: the scaler knows only the training rows. Fit it on all rows and the test set has leaked in.' },
  ],
  edges: [{ from: 'fa-fit', to: 'fa-apply' }],
})

// §8.6 — the pipeline: every step above, in one object that fits on train only.
const [rows, cols] = nums(textOf(C(f6), 13))
export const featuresPipeline: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(f6), show: [12, 13], view: { 12: { head: 3, tail: 1 }, 13: { head: 3, tail: 2 } },
  side: [
    {
      type: 'group', id: 'ct', title: 'ColumnTransformer: prepare', icon: 'workflow', tone: 'ingest', dir: 'row', children: [
        {
          type: 'group', id: 'ct-num', title: 'six numbers', tone: 'store', children: [
            { type: 'item', id: 'ct-imp', title: 'SimpleImputer', sub: 'fills missing built with the median', chip: true },
            { type: 'item', id: 'ct-sc', title: 'StandardScaler', chip: true },
          ],
        },
        {
          type: 'group', id: 'ct-area', title: 'area', tone: 'source', children: [
            { type: 'item', id: 'ct-oh', title: 'OneHotEncoder', sub: 'five 0/1 columns', chip: true },
          ],
        },
      ],
    },
    { type: 'item', id: 'ct-out', title: `${rows.toLocaleString('en-GB')} rows × ${cols} columns, ready`, sub: '6 scaled numbers + 5 area columns', icon: 'table' },
    {
      type: 'table', id: 'fit-transform', title: 'fit and transform', tone: 'ingest', columns: ['step', '.fit() learns', '.transform() does'], rows: [
        ['SimpleImputer', 'each column\'s median', 'fills gaps with it'],
        ['StandardScaler', 'means and stds', 'rescales'],
        ['OneHotEncoder', 'the five areas', 'writes 0/1 columns'],
      ],
    },
    { type: 'note', id: 'pipe-note', tone: 'store', text: 'One object: fit() learns every step from the training rows, transform() applies them to any rows. No step can peek at the test set.' },
  ],
  edges: [{ from: 'ct-imp', to: 'ct-sc' }],
})

export const featuresScenes: Record<string, SceneModel> = {
  'features-target': featuresTarget,
  'features-split': featuresSplit,
  'features-leakage': featuresLeakage,
  'features-encoding': featuresEncoding,
  'features-scaling': featuresScaling,
  'features-pipeline': featuresPipeline,
}
