import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { outputOf } from '../lab'
import session from '../../../spine/setup/02-notebook/session.txt?raw'
import ipynb from '../../../spine/setup/02-notebook/project/notebooks/explore.ipynb?raw'

// §2.2 — ◆ full scene: what a notebook is. Three programs and one file. The browser draws the
// cells; the Jupyter server passes them on and saves the file; the KERNEL is a Python process that
// runs them and keeps every name alive between cells. The lab (spine/setup/02-notebook) ran the
// notebook headlessly, printed the saved cell's real JSON, and listed the kernel it used.
const cellJson = outputOf(session, `python -c "import json; print(json.dumps(json.load(open('notebooks/explore.ipynb'))['cells'][0], indent=1))"`)
const kernels = outputOf(session, 'jupyter kernelspec list')
const at = (text: string) => lineOf(cellJson, text)
const source = (JSON.parse(ipynb).cells[0].source as string[]).join('')
const shape = /"(\(\d+, \d+\))"/.exec(cellJson)![1]

export const setupNotebook: SceneModel = {
  title: 'What a notebook is',
  sub: 'three programs and one file: JupyterLab 4.6, a Python 3.15.1 kernel',
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'programs', bare: true, children: [
        {
          type: 'group', id: 'browser', badge: 1, title: 'The browser', sub: 'JupyterLab: draws cells, sends one to run', icon: 'screen', tone: 'source', children: [
            { type: 'code', id: 'typed', filename: 'cell [1]', lang: 'python', code: source },
          ],
        },
        {
          type: 'group', id: 'server', badge: 2, title: 'The Jupyter server', sub: 'passes code and results; saves the file', icon: 'server', tone: 'ingest', children: [
            { type: 'item', id: 'save', title: 'notebooks/explore.ipynb', sub: 'JSON on disk: source, count, outputs', icon: 'file' },
          ],
        },
        {
          type: 'group', id: 'kernel', badge: 3, title: 'The kernel', sub: 'one Python process, alive between cells', icon: 'python', tone: 'store', children: [
            { type: 'table', id: 'names', title: 'its names, kept in memory', columns: ['name', 'holds'], rows: [['pd', 'the pandas module'], ['homes', `a DataFrame, ${shape}`]] },
            { type: 'code', id: 'kspec', terminal: true, filename: 'jupyter kernelspec list', code: kernels },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'file', badge: 4, title: 'The file', sub: 'cell [1], as saved: the real JSON', icon: 'code', tone: 'ingest', children: [
        {
          type: 'code', id: 'json', lang: 'js', code: cellJson,
          show: [[1, at('"id"')], [at('"outputs"'), cellJson.split('\n').length]],
          highlight: [at('"execution_count": 1'), at(`"${shape}"`), at('"source"')],
        },
      ],
    },
  ],
  edges: [
    { from: 'browser', to: 'server', label: 'run this cell', bidirectional: true },
    { from: 'server', to: 'kernel', label: 'code / result', bidirectional: true },
    { from: 'save', to: 'file', label: 'saves' },
  ],
}
