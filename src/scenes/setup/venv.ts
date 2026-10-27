import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { tree } from '../tree'
import pyproject from '../../../spine/setup/01-venv/project/pyproject.toml?raw'
import session from '../../../spine/setup/01-venv/session.txt?raw'

// §2.1 — the project folder, its own Python, and the four tools of the course. Versions are what the
// replay printed (pandas and NumPy from one import, JupyterLab from its own --version), never typed.
const [pandas, numpy] = outputOf(session, 'python -c "import pandas, numpy; print(pandas.__version__, numpy.__version__)"').split(' ')
const lab = outputOf(session, 'jupyter lab --version')
const mpl = /"matplotlib==([\d.]+)"/.exec(pyproject)![1]

export const setupVenv: SceneModel = ideFrame({
  tree: tree({ active: 'pyproject.toml', notebooks: [] }).map((e) => (e.name === '.venv' ? { ...e, state: 'new' as const, note: 'just made' } : e)),
  editor: { file: 'pyproject.toml', code: pyproject, lang: 'text', highlight: linesFrom(pyproject, '[dependency-groups]', 'jupyterlab') },
  session,
  side: [
    {
      type: 'group', id: 'install', title: 'pip install --group notebook', icon: 'package', tone: 'ingest', children: [
        { type: 'item', id: 'toml', title: 'pyproject.toml', sub: 'the project, and the tools it needs, pinned', icon: 'file' },
        {
          type: 'group', id: 'site', title: '.venv/lib/…/site-packages', sub: 'installed for this project only', tone: 'store', dir: 'grid', cols: 2, children: [
            { type: 'item', id: 'pandas', title: `pandas ${pandas}`, sub: 'tables: the DataFrame', icon: 'pandas' },
            { type: 'item', id: 'numpy', title: `NumPy ${numpy}`, sub: 'fast arrays underneath', icon: 'layers' },
            { type: 'item', id: 'mpl', title: `matplotlib ${mpl}`, sub: 'charts', icon: 'chart' },
            { type: 'item', id: 'lab', title: `JupyterLab ${lab}`, sub: 'the notebook', icon: 'jupyter' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'why', title: 'Why pinned', tone: 'ingest', columns: ['without a pin', 'with one'], rows: [
        ['a later install gets a newer pandas', `pandas==${pandas}, every time`],
        ['outputs change under you', 'every number here replays'],
      ],
    },
    {
      type: 'table', id: 'folder', title: 'house-prices/, after these commands', tone: 'store', columns: ['entry', 'what it is'], rows: [
        ['data/homes.csv', 'the sales: given, never edited'],
        ['pyproject.toml', 'the project and its pinned tools'],
        { cells: ['.venv/', "its own Python: made here"], tone: 'store' },
      ],
    },
    { type: 'note', id: 'venv-note', tone: 'store', text: 'A group is a named list of tools. The project is not a package yet: that comes in the last course.' },
  ],
  edges: [{ from: 'toml', to: 'site', label: 'pip reads the group' }],
})
