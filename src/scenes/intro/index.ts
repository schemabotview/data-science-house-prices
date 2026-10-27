import type { SceneModel } from '@graphlearning/graphl-flow'
import s4 from '../../../spine/ship/04-command/session.txt?raw'
import s6 from '../../../spine/ship/06-api/session.txt?raw'
import trainSession from '../../../spine/ship/03-train/session.txt?raw'
import raw from '../../../data/homes.csv?raw'

// Course 1 — the two concept scenes that open the video. §1.2 shows the payoff first: the finished
// command and service answering, quoted from Course 11's replayed sessions, never retyped.

// §1.1 — what data science is: a question, and the steps from data to an answer people can use.
const step = (id: string, badge: number, title: string, sub: string, icon: string, course: string, tone: 'source' | 'ingest' | 'store' | 'serve') => ({
  type: 'group' as const, id, badge, title, sub, icon, tone, children: [{ type: 'item' as const, id: `${id}-c`, title: course, chip: true }],
})
export const introDataScience: SceneModel = {
  title: 'What data science is',
  sub: 'turning data into an answer you can trust, and then into something people can use',
  nodes: [
    {
      type: 'group', id: 'steps', bare: true, dir: 'row', children: [
        step('q', 1, 'A question', 'what is this house worth?', 'search', 'Course 1', 'source'),
        step('d', 2, 'The data', 'a CSV of sales, in a notebook', 'table', 'Courses 2–3', 'ingest'),
        step('c', 3, 'Clean it', 'find every fault, fix it, write it down', 'filter', 'Course 4', 'ingest'),
        step('e', 4, 'Explore it', 'group, join, draw, measure', 'chart', 'Courses 5–7', 'ingest'),
        step('m', 5, 'Model it', 'predict, and say how sure', 'cpu', 'Courses 8–10', 'store'),
        step('s', 6, 'Ship it', 'a package, a command, an API', 'package', 'Course 11', 'serve'),
      ],
    },
    {
      type: 'group', id: 'tools', title: 'the tools, one per job', icon: 'layers', tone: 'neutral', dir: 'row', span: 'all', children: [
        { type: 'item', id: 't-py', title: 'Python 3.15', icon: 'python', chip: true },
        { type: 'item', id: 't-jup', title: 'JupyterLab', icon: 'jupyter', chip: true },
        { type: 'item', id: 't-pd', title: 'pandas', icon: 'pandas', chip: true },
        { type: 'item', id: 't-np', title: 'NumPy, SciPy', icon: 'layers', chip: true },
        { type: 'item', id: 't-sk', title: 'scikit-learn', icon: 'cpu', chip: true },
        { type: 'item', id: 't-api', title: 'pytest, FastAPI', icon: 'check', chip: true },
      ],
    },
  ],
  edges: [{ from: 'q', to: 'd' }, { from: 'd', to: 'c' }, { from: 'c', to: 'e' }, { from: 'e', to: 'm' }, { from: 'm', to: 's' }],
}

// §1.2 — what we'll build: from the raw file to a valuation with its range, and a refusal.
const asked = s4.split('\n').slice(0, 2)
const refusal = s4.split('\n').slice(4, 6)
const reply = /^\{"price".*\}$/m.exec(s6)![0]
const mae = /test MAE (£[\d,]+)/.exec(trainSession)![1]
export const introWhatWeBuild: SceneModel = {
  title: "What we'll build",
  sub: `house-prices: from Millbrook's raw sales to a valuation with its range (test error ${mae})`,
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'start', title: 'It starts here', icon: 'file', tone: 'source', children: [
        { type: 'code', id: 'csv', filename: 'data/homes.csv: 1,460 sales', lang: 'text', code: raw.split('\n').slice(0, 4).map((l) => l.split(',').slice(0, 6).join(',') + ',…').join('\n') },
        { type: 'item', id: 'faults', title: 'and it is not clean', sub: 'prices as text, two date formats, square metres, duplicates…', icon: 'search' },
      ],
    },
    {
      type: 'group', id: 'journey', title: 'Built along the way', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'j-nb', title: '7 notebooks', sub: 'explore, clean, measure, model', icon: 'jupyter', chip: true },
        { type: 'item', id: 'j-pkg', title: 'house_prices/', sub: 'a tested Python package', icon: 'python', chip: true },
      ],
    },
    {
      type: 'group', id: 'end', title: 'It ends here', icon: 'terminal', tone: 'store', children: [
        { type: 'code', id: 'cmd', terminal: true, filename: 'the house-prices command', code: [...asked, ...refusal].join('\n').replace(/^(house-prices: .*)$/m, '! $1') },
        { type: 'code', id: 'api', terminal: true, filename: 'the web service: POST /value', code: reply },
      ],
    },
  ],
  edges: [{ from: 'start', to: 'journey' }, { from: 'journey', to: 'end' }],
}

export const introScenes: Record<string, SceneModel> = {
  'intro-data-science': introDataScience,
  'intro-what-we-build': introWhatWeBuild,
}
