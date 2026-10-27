import type { SceneModel } from '@graphlearning/graphl-flow'
import { notebookFrame, num, outputOf, seriesOf, textOf, type Cell } from '../notebook'
import { tree } from '../tree'
import c1 from '../../../spine/clean/01-missing/cells.json'
import c2 from '../../../spine/clean/02-meaning/cells.json'
import c3 from '../../../spine/clean/03-types/cells.json'
import c4 from '../../../spine/clean/04-units/cells.json'
import c5 from '../../../spine/clean/05-duplicates/cells.json'
import c6 from '../../../spine/clean/06-outliers/cells.json'
import c8 from '../../../spine/clean/08-clean-function/cells.json'
import raw from '../../../data/homes.csv?raw'
import cleaned from '../../../spine/clean/08-clean-function/project/data/homes_clean.csv?raw'

// Course 4 — make the data trustworthy, in notebooks/clean.ipynb. Each planted fault is found by a
// cell and fixed by a cell; the side panes quote the kernel's numbers (cells.json), never typed.
const FILE = 'notebooks/clean.ipynb'
const files = { active: FILE, notebooks: ['explore.ipynb', 'select.ipynb', 'clean.ipynb'] }
const C = (x: unknown) => x as Cell[]
const thousands = (n: number) => n.toLocaleString('en-GB')

// §4.1 — missing values: count them, then their share.
const missing = seriesOf(textOf(C(c1), 1))
const share = new Map(seriesOf(textOf(C(c1), 2)))
const [rawN, tidyN] = [...textOf(C(c8), 20).matchAll(/\d+/g)].map((m) => Number(m[0]))
export const cleanMissing: SceneModel = notebookFrame({
  tree: tree({ ...files, fresh: [FILE] }), file: FILE, cells: C(c1),
  side: [
    {
      type: 'table', id: 'gaps', title: 'missing, per column', tone: 'ingest', columns: ['column', 'missing', 'share'],
      rows: missing.map(([k, v]) => ({ cells: [k, v, share.get(k)!], tone: v !== '0' ? 'consume' as const : undefined })),
    },
    {
      type: 'group', id: 'nan', title: 'how pandas marks a gap: built is there, garage is ,,', icon: 'search', tone: 'ingest', children: [
        { type: 'code', id: 'nan-csv', filename: 'homes.csv, line 2', lang: 'text', code: raw.split('\n')[1].split(',').slice(0, 9).join(',') + ',…' },
        { type: 'item', id: 'nan-pd', title: 'NaN', sub: 'a float: the column becomes float64', icon: 'table' },
      ],
    },
    { type: 'note', id: 'miss-note', tone: 'consume', text: `isna() is True where a value is missing; .sum() counts the Trues, .mean() gives their share of ${thousands(rawN)} rows.` },
  ],
  edges: [{ from: 'nan-csv', to: 'nan-pd', label: 'read_csv' }],
})

// §4.2 — missing MEANS something: garage has no 0 anywhere, so empty is "no garage".
const garages = seriesOf(textOf(C(c2), 3))
const builtLeft = seriesOf(textOf(C(c2), 4))[0]
export const cleanMeaning: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(c2), show: [3, 4],
  side: [
    {
      type: 'table', id: 'garage-counts', title: 'garage, NaN included', tone: 'ingest', columns: ['value', 'sales'],
      rows: garages.map(([k, v]) => ({ cells: [k, v], tone: k === 'NaN' ? 'consume' as const : undefined })),
    },
    {
      type: 'table', id: 'decisions', title: 'one decision per column, with its reason', tone: 'store', columns: ['column', 'empty means', 'so'], rows: [
        { cells: ['garage', 'no garage: no row says 0', 'fill 0'], tone: 'store' },
        { cells: [builtLeft[0], 'unknown, for old houses', `keep NaN (${builtLeft[1]})`], tone: 'consume' },
      ],
    },
    {
      type: 'plot', id: 'garage-after', compact: true, title: 'garages, after fillna(0)', tone: 'store', x: { labels: ['0', '1', '2', '3'] }, y: { min: 0, max: 600, step: 200 },
      series: [{ kind: 'bar', label: 'sales', points: ['NaN', '1.0', '2.0', '3.0'].map((key, i) => [i, Number(garages.find(([g]) => g === key)![1])]) }],
    },
    { type: 'note', id: 'meaning-note', tone: 'store', text: 'Never fill a gap with a number you invented. Fill only what the data itself tells you; leave the rest missing, and say so.' },
  ],
})

// §4.3 — wrong types: find the text prices, see their pattern, convert the whole column.
const bad = outputOf(C(c3), 5).table!
const badCount = num(textOf(C(c3), 6))
const median = num(/float64\(([\d.]+)\)/.exec(textOf(C(c3), 7))![1])
const example = bad.rows[0][2]
const steps = [example, example.replace('£', ''), example.replace('£', '').replace(',', '')]
export const cleanTypes: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(c3), show: [5, 6, 7],
  side: [
    {
      type: 'group', id: 'convert', title: 'one price, text to number', icon: 'filter', tone: 'ingest', children: [
        { type: 'item', id: 'p0', title: `"${steps[0]}"`, sub: 'as the export wrote it', chip: true },
        { type: 'item', id: 'p1', title: `"${steps[1]}"`, sub: 'still text', chip: true },
        { type: 'item', id: 'p2', title: `"${steps[2]}"`, sub: 'digits only', chip: true },
        { type: 'item', id: 'p3', title: steps[2], sub: 'int64: a number at last', chip: true },
      ],
    },
    {
      type: 'table', id: 'found', title: 'what errors="coerce" found', tone: 'consume', columns: ['asked', 'answer'], rows: [
        ['not numbers', String(badCount)],
        ['written by (all shown)', [...new Set(bad.rows.map((r) => r[1]))].join(', ')],
        { cells: ['median, as a number', `£${thousands(median)}`], tone: 'store' },
      ],
    },
  ],
  edges: [
    { from: 'p0', to: 'p1', label: 'remove £' },
    { from: 'p1', to: 'p2', label: 'remove ,' },
    { from: 'p2', to: 'p3', label: 'to_numeric' },
  ],
})

// §4.4 — units: sq ft per bedroom exposes a batch in m²; the batch is named by agent and dates.
const per = (cell: number) => new Map(seriesOf(textOf(C(c4), cell)))
const before = per(8), after = per(11)
const [batchSize, batchLow, otherLow] = [...textOf(C(c4), 10).matchAll(/\((\d+)\)/g)].map((m) => Number(m[1]))
export const cleanUnits: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(c4), show: [8, 9, 10, 11], view: { 8: { head: 0 }, 11: { head: 0 } },
  side: [
    {
      type: 'table', id: 'per-bed', title: 'sq ft per bedroom', tone: 'ingest', columns: ['', 'before', 'after × 10.764'],
      rows: ['min', '25%', '50%', '75%'].map((k) => ({ cells: [k, before.get(k)!, after.get(k)!], tone: k === 'min' ? 'consume' as const : undefined })),
    },
    {
      type: 'group', id: 'batch', title: 'Keyline, April to June 2023', icon: 'search', tone: 'consume', dir: 'row', children: [
        { type: 'item', id: 'b-size', title: `${batchSize} sales`, sub: `${batchLow} of them under 200 sq ft a bed`, chip: true },
        { type: 'item', id: 'b-fix', title: '× 10.764', sub: 'square metres to square feet', chip: true },
      ],
    },
    {
      type: 'table', id: 'suspects', title: 'under 200 sq ft a bedroom (cell 9)', tone: 'consume', columns: ['sold', 'agent', 'sqft', 'beds'],
      rows: outputOf(C(c4), 9).table!.rows.map((r) => r.slice(1)),
    },
    { type: 'note', id: 'units-note', tone: 'consume', text: `Fix the batch the agent named, not every small number: ${otherLow} other row is under 200 too, and it is a different fault (§4.6).` },
  ],
  edges: [{ from: 'b-size', to: 'b-fix' }],
})

// §4.5 — duplicates: the same sale twice, same id and all.
const pairs = outputOf(C(c5), 13).table!
const shape = textOf(C(c5), 14)
export const cleanDuplicates: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(c5), show: [12, 13, 14],
  side: [
    {
      type: 'table', id: 'pairs', title: 'keep=False: both copies shown', tone: 'consume', columns: ['row', ...pairs.columns],
      rows: pairs.rows.map((r, i) => ({ cells: r, tone: i % 2 ? 'consume' as const : undefined })),
    },
    {
      type: 'table', id: 'dupe-count', title: 'before and after drop_duplicates()', tone: 'store', columns: ['', 'rows'], rows: [
        ['read from the file', thousands(rawN)],
        ['duplicated() — the second copies', String(num(textOf(C(c5), 12)))],
        { cells: ['after', shape], tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'compare', title: 'duplicated() compares whole rows', icon: 'search', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'cmp-same', title: 'every column equal', sub: 'True: a copy, drop it', icon: 'check' },
        { type: 'item', id: 'cmp-diff', title: 'same id, a column differs', sub: 'False: you decide which is right', icon: 'search' },
      ],
    },
    { type: 'note', id: 'dupe-note', tone: 'consume', text: 'A duplicate is not a second house at the same price. Same id, same date, every column equal: one sale, entered twice.' },
  ],
})

// §4.6 — outliers: the IQR fences flag rows to LOOK AT; each gets its own decision.
const fences = /^\(([\d.]+), ([\d.]+), np\.int64\((\d+)\), np\.int64\((\d+)\)\)$/.exec(textOf(C(c6), 16))!
const [low, high, nLow, nHigh] = fences.slice(1).map(Number)
const quart = new Map(outputOf(C(c6), 15).table!.rows.map((r) => [r[0], Number(r[2])]))
const flagged = outputOf(C(c6), 17).table!
const k = (n: number) => Math.round(n / 1000)
export const cleanOutliers: SceneModel = notebookFrame({
  tree: tree(files), file: FILE, cells: C(c6), show: [15, 16, 17, 18],
  side: [
    {
      type: 'plot', id: 'fences', compact: true, title: 'price (£k): the IQR fences', tone: 'ingest', x: { min: 0, max: 700, step: 100, label: '£k' }, y: { min: 0, max: 2, step: 1 }, grid: false,
      series: [
        { kind: 'segment', from: [k(quart.get('25%')!), 0.4], to: [k(quart.get('75%')!), 0.4], label: 'middle half', dashed: false, tone: 'store' },
        { kind: 'segment', from: [k(low), 0], to: [k(low), 2], label: 'low fence' },
        { kind: 'segment', from: [k(high), 0], to: [k(high), 2], label: 'high fence' },
        { kind: 'scatter', points: [[k(quart.get('min')!), 1.6]], label: `£${thousands(quart.get('min')!)}`, tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'verdicts', title: 'flagged, then decided one by one', tone: 'store', columns: ['row', 'why flagged', 'verdict'], rows: [
        { cells: [`id ${flagged.rows[0][1]}`, `${flagged.rows[0][4]} beds, ${flagged.rows[0][3]} sq ft`, 'typo: 2 beds'], tone: 'consume' },
        { cells: [`id ${flagged.rows[1][1]}`, `£${thousands(Number(flagged.rows[1][5]))}`, 'a transfer: drop'], tone: 'consume' },
        { cells: [`${nHigh} sales`, `over £${k(high)}k`, 'real big houses: keep'], tone: 'store' },
      ],
    },
    { type: 'note', id: 'out-note', tone: 'ingest', text: `${nLow} below the low fence, ${nHigh} above the high one. An outlier is a question, not an error: only the two that are wrong change.` },
  ],
})

// §4.7 — ◆ full scene: tidy data. The three rules, where Millbrook's export broke each, and the
// ledger of what cleaning did — every count from the cells above, every example from the two files.
const rawLine = raw.split('\n')[2], tidyLine = cleaned.split('\n')[2]
const transfer = `£${thousands(Number(flagged.rows[1][5]))}`, typoBeds = flagged.rows[0][4]
export const cleanTidy: SceneModel = {
  title: 'Tidy data',
  sub: 'every variable a column, every sale a row, every value one meaning',
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'rules', bare: true, children: [
        {
          type: 'group', id: 'r1', badge: 1, title: 'Each variable is one column, of one type', tone: 'ingest', icon: 'table', children: [
            { type: 'item', id: 'r1-x', title: `price mixed numbers and text: ${badCount} rows like "${example}"`, icon: 'zap' },
            { type: 'item', id: 'r1-y', title: 'sold mixed two date formats', icon: 'clock' },
          ],
        },
        {
          type: 'group', id: 'r2', badge: 2, title: 'Each sale is one row', tone: 'source', icon: 'layers', children: [
            { type: 'item', id: 'r2-x', title: `${String(num(textOf(C(c5), 12)))} sales entered twice`, icon: 'file' },
            { type: 'item', id: 'r2-y', title: `one row was not a sale at all: a ${transfer} transfer`, icon: 'search' },
          ],
        },
        {
          type: 'group', id: 'r3', badge: 3, title: 'Each value means one thing', tone: 'store', icon: 'key', children: [
            { type: 'item', id: 'r3-x', title: `sqft: ${batchSize} sales in square metres`, icon: 'filter' },
            { type: 'item', id: 'r3-y', title: 'garage: empty meant 0; area: "Riverside " meant Riverside', icon: 'check' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'result', bare: true, children: [
        {
          type: 'table', id: 'ledger', title: 'the cleaning ledger', tone: 'store', columns: ['fault', 'rows', 'fix'], rows: [
            ['price as text', String(badCount), 'strip £ and ,'],
            ['two date formats', 'all', 'parse each format'],
            ['m² batch', String(batchSize), '× 10.764'],
            ['empty garage', garages.find(([k]) => k === 'NaN')![1], '0'],
            ['duplicates', String(num(textOf(C(c5), 12))), 'drop'],
            [`${typoBeds} beds`, '1', '2'],
            [`${transfer} transfer`, '1', 'drop'],
            { cells: ['rows: raw → tidy', '', textOf(C(c8), 20).replace(/[()]/g, '').replace(', ', ' → ')], tone: 'store' },
          ],
        },
        { type: 'code', id: 'raw-line', filename: 'homes.csv, line 3', lang: 'text', code: rawLine },
        { type: 'code', id: 'tidy-line', filename: 'homes_clean.csv, line 3', lang: 'text', code: tidyLine },
      ],
    },
  ],
  edges: [{ from: 'raw-line', to: 'tidy-line', label: 'clean()' }],
}

// §4.8 — clean(): every rule in one function, chained, asserted, saved for the next courses.
export const cleanFunction: SceneModel = notebookFrame({
  tree: tree({ ...files, data: ['homes.csv', 'homes_clean.csv'], fresh: ['data/homes_clean.csv'] }), file: FILE, cells: C(c8), show: [19, 20, 21], view: { 21: { head: 3, tail: 2 } },
  side: [
    {
      type: 'group', id: 'chain', title: 'clean(raw): one chain', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'k-raw', title: `raw: ${thousands(rawN)} rows`, sub: 'pd.read_csv, as exported', chip: true },
        { type: 'item', id: 'k-assign', title: '.assign(…)', sub: 'sold, area, garage, price, sqft, beds', chip: true },
        { type: 'item', id: 'k-dupes', title: '.drop_duplicates()', chip: true },
        { type: 'item', id: 'k-query', title: '.query("price > 20_000")', chip: true },
        { type: 'item', id: 'k-out', title: `tidy: ${thousands(tidyN)} rows → homes_clean.csv`, chip: true },
      ],
    },
    {
      type: 'table', id: 'asserts', title: 'what cell 20 asserts, on every run', tone: 'store', columns: ['assert', 'guards against'], rows: [
        ['price dtype is int64', 'text prices'],
        ['every sold is a date', 'a third date format'],
        ['no duplicated rows', 'a sale entered twice'],
        ['beds ≤ 6', 'a bedroom typo'],
      ],
    },
    { type: 'note', id: 'fn-note', tone: 'store', text: 'The asserts are the notebook checking itself: if a rule ever stops holding, the cell fails loudly instead of the chart lying quietly.' },
  ],
  edges: [
    { from: 'k-raw', to: 'k-assign' }, { from: 'k-assign', to: 'k-dupes' }, { from: 'k-dupes', to: 'k-query' }, { from: 'k-query', to: 'k-out' },
  ],
})

export const cleanScenes: Record<string, SceneModel> = {
  'clean-missing': cleanMissing,
  'clean-meaning': cleanMeaning,
  'clean-types': cleanTypes,
  'clean-units': cleanUnits,
  'clean-duplicates': cleanDuplicates,
  'clean-outliers': cleanOutliers,
  'clean-tidy': cleanTidy,
  'clean-function': cleanFunction,
}
