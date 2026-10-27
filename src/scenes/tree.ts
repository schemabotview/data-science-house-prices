import type { TreeEntry } from '@graphlearning/graphl-flow'

// The explorer, course by course. One function, so a file added in one course stays in every frame
// after it. `active` is the open file (the notebook, or an editor's file); `fresh` marks what the
// section adds.
export interface TreeState {
  active?: string
  fresh?: string[]
  /** Notebooks that exist so far, in notebooks/. */
  notebooks?: string[]
  /** Data files that exist so far, in data/. */
  data?: string[]
  /** Extra top-level entries (the package, tests, …), from Course 11. */
  extra?: TreeEntry[]
}

export const venv: TreeEntry = { name: '.venv', folder: true, state: 'muted', note: "this project's Python" }

export function tree({ active, fresh = [], notebooks = ['explore.ipynb'], data = ['homes.csv'], extra = [] }: TreeState): TreeEntry[] {
  const mark = (path: string, name: string): TreeEntry => ({
    name, state: active === path ? 'active' : fresh.includes(path) ? 'new' : undefined,
  })
  return [
    venv,
    { name: 'data', children: data.map((f) => mark(`data/${f}`, f)) },
    ...(notebooks.length ? [{ name: 'notebooks', children: notebooks.map((f) => mark(`notebooks/${f}`, f)) }] : []),
    ...extra,
    mark('pyproject.toml', 'pyproject.toml'),
  ]
}
