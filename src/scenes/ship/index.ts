import type { SceneModel, TreeEntry } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { tree } from '../tree'
import s1 from '../../../spine/ship/01-module/session.txt?raw'
import s2 from '../../../spine/ship/02-tests/session.txt?raw'
import s3 from '../../../spine/ship/03-train/session.txt?raw'
import s4 from '../../../spine/ship/04-command/session.txt?raw'
import s5 from '../../../spine/ship/05-batch/session.txt?raw'
import s6 from '../../../spine/ship/06-api/session.txt?raw'
import clean from '../../../spine/ship/01-module/project/house_prices/clean.py?raw'
import tests from '../../../spine/ship/02-tests/project/tests/test_clean.py?raw'
import train from '../../../spine/ship/03-train/project/house_prices/train.py?raw'
import cli4 from '../../../spine/ship/04-command/project/house_prices/cli.py?raw'
import cli5 from '../../../spine/ship/05-batch/project/house_prices/cli.py?raw'
import api from '../../../spine/ship/06-api/project/house_prices/api.py?raw'
import modelCells from '../../../spine/trust/07-reproducible/cells.json'

// Course 11 — from notebook to tool, in the IDE frame. Every file is the spine's, every terminal line
// the replay's (scripts/spine.py ran each session for real: pip, pytest, the command, uvicorn, curl).
const NBS = ['explore.ipynb', 'select.ipynb', 'clean.ipynb', 'shape.ipynb', 'see.ipynb', 'stats.ipynb', 'model.ipynb']
const DATA = ['areas.csv', 'homes.csv', 'homes_clean.csv']
const pkg = (files: string[], active?: string, fresh: string[] = []): TreeEntry => ({
  name: 'house_prices', children: files.map((f) => ({ name: f, state: active === f ? 'active' as const : fresh.includes(f) ? 'new' as const : undefined })),
})
const notebooks: TreeEntry = { name: 'notebooks', folder: true, state: 'muted' }
const shipTree = (extra: TreeEntry[], data = DATA, pyproject?: 'new'): TreeEntry[] =>
  tree({ notebooks: NBS, data, extra }).map((e) => (e.name === 'notebooks' ? notebooks : e.name === 'pyproject.toml' && pyproject ? { ...e, state: 'new' as const, note: 'M' } : e))
const testsDir = (active = false, fresh = false): TreeEntry => ({ name: 'tests', children: [{ name: 'test_clean.py', state: active ? 'active' : fresh ? 'new' : undefined }] })
const models: TreeEntry = { name: 'models', folder: true, state: 'muted' }

// §11.1 — notebook → module: clean() leaves the notebook and becomes importable.
const shape = outputOf(s1, `python -c "from house_prices.clean import load_sales; print(load_sales('data/homes.csv').shape)"`)
export const shipModule: SceneModel = ideFrame({
  tree: shipTree([pkg(['__init__.py', 'clean.py'], 'clean.py', ['__init__.py', 'clean.py'])], DATA, 'new'),
  editor: { file: 'house_prices/clean.py', code: clean, highlight: linesFrom(clean, 'def load_sales', 'return clean') },
  session: s1,
  side: [
    {
      type: 'group', id: 'move', title: 'from a cell to a module', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'm-nb', title: 'notebooks/clean.ipynb, cell 19', sub: 'lives in one kernel; gone on restart', icon: 'jupyter' },
        { type: 'item', id: 'm-py', title: 'house_prices/clean.py', sub: 'a file: imported, tested, versioned', icon: 'python' },
        { type: 'item', id: 'm-use', title: 'from house_prices.clean import load_sales', sub: `pip install -e .: importable anywhere in the venv — ${shape.trim()}`, icon: 'code' },
      ],
    },
    {
      type: 'table', id: 'pyproject', title: 'pyproject.toml grows up', tone: 'store', columns: ['new section', 'means'], rows: [
        ['[build-system]', 'how to build the package'],
        ['dependencies', 'what it needs to run'],
        ['packages', '["house_prices"]'],
      ],
    },
  ],
  edges: [{ from: 'm-nb', to: 'm-py', label: 'moved' }, { from: 'm-py', to: 'm-use' }],
})

// §11.2 — tests: one per planted fault, so a later change cannot quietly undo a fix.
const passed = /(\d+) passed/.exec(s2)![1]
const testNames = [...tests.matchAll(/^def (test_\w+)/gm)].map((m) => m[1])
const FAULT: Record<string, string> = {
  test_price_with_pound_sign_and_commas: '§4.3',
  test_day_first_dates: '§3.6',
  test_square_metre_batch: '§4.4',
  test_empty_garage_means_none: '§4.2',
  test_duplicate_sales_dropped: '§4.5',
  test_transfer_dropped: '§4.6',
  test_area_spellings: '§3.5, §5.4',
}
export const shipTests: SceneModel = ideFrame({
  tree: shipTree([pkg(['__init__.py', 'clean.py']), testsDir(true, true)], DATA, 'new'),
  editor: { file: 'tests/test_clean.py', code: tests, highlight: linesFrom(tests, 'def test_price_with', 'assert clean(raw(price=') },
  session: s2,
  side: [
    {
      type: 'table', id: 'faults', title: 'one test per fault cleaning fixed', tone: 'store', columns: ['test_…', 'fault from'],
      rows: testNames.map((t) => ({ cells: [t.replace('test_', ''), FAULT[t] ?? ''] })),
    },
    {
      type: 'group', id: 'how', title: 'a pytest test', icon: 'check', tone: 'ingest', children: [
        { type: 'item', id: 't-raw', title: 'raw(price="£215,000")', sub: 'one bad row', icon: 'file' },
        { type: 'item', id: 't-assert', title: 'assert … == 215_000', sub: 'what clean() must give', icon: 'check' },
        { type: 'item', id: 't-run', title: `pytest: ${passed} passed`, sub: 'change clean() later, and a broken fix fails here', icon: 'terminal', tone: 'store' },
      ],
    },
  ],
  edges: [{ from: 't-raw', to: 't-assert', label: 'clean()' }, { from: 't-assert', to: 't-run' }],
})

// §11.3 — train and save: the notebook's model, rebuilt from raw data by one command.
const trainOut = outputOf(s3, 'python -m house_prices.train')
const mae = /£([\d,]+)/.exec(trainOut)![1]
// §10.5's check of this very interval: cell 38's last number is the share of test prices it held.
const coverage = `${Math.round(Number(/([\d.]+)\)\)$/.exec((modelCells as { cell: number; outputs: { text?: string }[] }[]).find((c) => c.cell === 38)!.outputs[0].text!.trim())![1]) * 1000) / 10}%`
const notebookMae = (modelCells as { cell: number; outputs: { text?: string }[] }[]).find((c) => c.cell === 42)!.outputs[0].text!.trim()
export const shipTrain: SceneModel = ideFrame({
  tree: shipTree([pkg(['__init__.py', 'clean.py', 'features.py', 'train.py'], 'train.py', ['features.py', 'train.py']), models, testsDir()]),
  editor: { file: 'house_prices/train.py', code: train, highlight: linesFrom(train, 'joblib.dump', 'model.json') },
  session: s3,
  side: [
    {
      type: 'group', id: 'pipeline', title: 'python -m house_prices.train', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'p-raw', title: 'data/homes.csv → load_sales()', sub: 'raw export, cleaned by clean()', chip: true },
        { type: 'item', id: 'p-fit', title: 'features() → prepare() + LinearRegression', sub: 'the same split, the same seed', chip: true },
        { type: 'item', id: 'p-save', title: 'models/model.joblib + model.json', sub: 'the fitted pipeline; its interval and limits', chip: true },
      ],
    },
    {
      type: 'table', id: 'same', title: 'the same model, two ways', tone: 'store', columns: ['built in', 'test MAE'], rows: [
        ['model.ipynb (§10.7)', `£${Number(notebookMae).toLocaleString('en-GB')}`],
        { cells: ['house_prices/train.py', `£${mae}`], tone: 'store' },
      ],
    },
  ],
  edges: [{ from: 'p-raw', to: 'p-fit' }, { from: 'p-fit', to: 'p-save' }],
})

// §11.4 — the command: one house in, a valuation (or a refusal) out.
const asks = [...s4.matchAll(/^\$ (house-prices value .*)\n(.*)$/gm)].map((m) => [m[1].replace('house-prices value ', ''), m[2]])
export const shipCommand: SceneModel = ideFrame({
  tree: shipTree([pkg(['__init__.py', 'clean.py', 'cli.py', 'features.py', 'train.py', 'value.py'], 'cli.py', ['cli.py', 'value.py']), models, testsDir()], DATA, 'new'),
  editor: { file: 'house_prices/cli.py', code: cli4, highlight: linesFrom(cli4, 'try:', 'print(f"£') },
  session: s4,
  side: [
    {
      type: 'group', id: 'flow', title: 'house-prices value …', icon: 'terminal', tone: 'ingest', children: [
        { type: 'item', id: 'c-args', title: 'argparse: --area --sqft --beds …', sub: '[project.scripts] makes the command', chip: true },
        { type: 'item', id: 'c-value', title: 'value(): inside the data?', sub: 'known area, sq ft in range, else refuse', chip: true },
        { type: 'item', id: 'c-out', title: 'price, and the 80% interval', sub: `which held ${coverage} of test prices (§10.5)`, chip: true },
      ],
    },
    {
      type: 'table', id: 'answers', title: 'four asks, as the terminal answered', tone: 'store', columns: ['area, ft²', 'answer'],
      rows: asks.map(([a, b]) => {
        const area = /--area (\S+)/.exec(a)![1], sqft = /--sqft (\d+)/.exec(a)![1]
        const refused = b.startsWith('house-prices:')
        return { cells: [`${area}, ${sqft}`, refused ? (b.includes('no sales') ? 'refused: area' : 'refused: size') : b.split(' (')[0]], tone: refused ? 'consume' as const : 'store' as const }
      }),
    },
  ],
  edges: [{ from: 'c-args', to: 'c-value' }, { from: 'c-value', to: 'c-out' }],
})

// §11.5 — batch: a file of listings in, a valued file out.
const valued = outputOf(s5, 'cut -d, -f1-3,8-10 valued.csv | head -6').split('\n').map((l) => l.split(','))
export const shipBatch: SceneModel = ideFrame({
  tree: shipTree([pkg(['__init__.py', 'clean.py', 'cli.py', 'features.py', 'train.py', 'value.py'], 'cli.py'), models, testsDir()], ['areas.csv', 'homes.csv', 'homes_clean.csv', 'listings.csv']).map((e) =>
    e.name === 'data' ? { ...e, children: e.children!.map((c) => (c.name === 'listings.csv' ? { ...c, state: 'new' as const } : c)) } : e),
  editor: { file: 'house_prices/cli.py', code: cli5, highlight: linesFrom(cli5, 'try:', 'rows.append({"note"') },
  session: s5,
  side: [
    {
      type: 'table', id: 'valued', title: 'valued.csv: the first 5 of 20 listings', tone: 'store', columns: valued[0],
      rows: valued.slice(1).map((r) => r.map((v, i) => (i >= 3 ? `£${Math.round(Number(v) / 1000)}k` : v))),
    },
    {
      type: 'group', id: 'files', title: 'one file in, one file out', icon: 'file', tone: 'ingest', children: [
        { type: 'item', id: 'f-in', title: 'data/listings.csv', sub: 'unsold houses, no price', icon: 'file' },
        { type: 'item', id: 'f-out', title: 'valued.csv', sub: '+ price, low, high', icon: 'table', tone: 'store' },
        { type: 'item', id: 'f-note', title: 'or a note, for a house it must refuse', sub: 'the batch never stops for one bad row', icon: 'search', tone: 'consume' },
      ],
    },
  ],
  edges: [{ from: 'f-in', to: 'f-out', label: 'value()' }, { from: 'f-out', to: 'f-note' }],
})

// §11.6 — a web API: the same value(), behind FastAPI.
const replies = [...s6.matchAll(/^\{.*\}$/gm)].map((m) => m[0])
const ok = JSON.parse(replies[0]) as { price: number; low: number; high: number }
export const shipApi: SceneModel = ideFrame({
  tree: shipTree([pkg(['__init__.py', 'api.py', 'clean.py', 'cli.py', 'features.py', 'train.py', 'value.py'], 'api.py', ['api.py']), models, testsDir()], ['areas.csv', 'homes.csv', 'homes_clean.csv', 'listings.csv'], 'new'),
  editor: { file: 'house_prices/api.py', code: api, highlight: [lineOf(api, 'class House'), ...linesFrom(api, '@app.post', 'return {')], show: [[lineOf(api, 'class House'), lineOf(api, 'condition: int')], linesFrom(api, '@app.post', 'return {').filter((_, i, a) => i === 0 || i === a.length - 1) as [number, number]] },
  session: s6,
  side: [
    {
      type: 'group', id: 'req', title: 'POST /value', icon: 'globe', tone: 'ingest', children: [
        { type: 'item', id: 'r-json', title: 'JSON body: area, sqft, beds …', chip: true },
        { type: 'item', id: 'r-check', title: 'House (pydantic): types and ranges', sub: 'bad input → 422, before any model runs', chip: true },
        { type: 'item', id: 'r-value', title: 'value(): the same function as the command', chip: true },
      ],
    },
    {
      type: 'table', id: 'replies', title: 'the two replies, from curl', tone: 'store', columns: ['asked', 'reply'], rows: [
        { cells: ['Riverside, 1710 ft²', `£${ok.price.toLocaleString('en-GB')}`], tone: 'store' },
        { cells: ['  its range', `£${ok.low / 1000}k–£${ok.high / 1000}k`], tone: 'store' },
        { cells: ['Harbourside', '422: refused'], tone: 'consume' },
      ],
    },
  ],
  edges: [{ from: 'r-json', to: 'r-check' }, { from: 'r-check', to: 'r-value' }],
})

// §11.7 — where next: the finished project, and each part at scale.
export const shipWhereNext: SceneModel = {
  title: 'Where next',
  sub: 'the finished project, and the tool each part grows into',
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'built', title: 'What we built', icon: 'package', tone: 'store', dir: 'grid', cols: 2, children: [
        { type: 'item', id: 'b-nb', title: 'notebooks/', sub: 'explore, clean, see, measure, model', icon: 'jupyter' },
        { type: 'item', id: 'b-pkg', title: 'house_prices/', sub: 'clean, features, train, value', icon: 'python' },
        { type: 'item', id: 'b-tests', title: 'tests/', sub: 'every planted fault, guarded', icon: 'check' },
        { type: 'item', id: 'b-cli', title: 'house-prices', sub: 'the command: one house, or a file', icon: 'terminal' },
        { type: 'item', id: 'b-api', title: 'POST /value', sub: 'the FastAPI service', icon: 'globe' },
      ],
    },
    {
      type: 'group', id: 'next', title: 'At scale', icon: 'layers', tone: 'ingest', dir: 'grid', cols: 2, children: [
        { type: 'item', id: 'n-data', title: 'millions of sales, not 1,460', sub: 'Spark, a lakehouse: the Spark series', icon: 'spark' },
        { type: 'item', id: 'n-pipe', title: 'retrain every month, on schedule', sub: 'Airflow, dbt: data pipelines', icon: 'airflow' },
        { type: 'item', id: 'n-ml', title: 'more models, and why they work', sub: 'the machine learning series', icon: 'cpu' },
        { type: 'item', id: 'n-ops', title: 'versioned models, monitored drift', sub: 'MLOps: Old Town, watched for you', icon: 'activity' },
        { type: 'item', id: 'n-stats', title: 'the maths behind §7', sub: 'probability and statistics', icon: 'chart' },
      ],
    },
  ],
  edges: [{ from: 'built', to: 'next' }],
}

export const shipScenes: Record<string, SceneModel> = {
  'ship-module': shipModule,
  'ship-tests': shipTests,
  'ship-train': shipTrain,
  'ship-command': shipCommand,
  'ship-batch': shipBatch,
  'ship-api': shipApi,
  'ship-where-next': shipWhereNext,
}
