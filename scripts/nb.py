#!/usr/bin/env python3
"""Author a spine notebook as text. A notebook in the spine is stored CLEAN — no outputs, no counts,
cell ids c1, c2, … — so a step's diff is its cells and nothing else (spine.py's lineage check compares
files byte for byte). Its outputs live in the step's cells.json, written by a real kernel.

  python3 scripts/nb.py text  <notebook.ipynb>             print it as text: cells split by `# %%`
  python3 scripts/nb.py write <notebook.ipynb> < cells.txt  write it from that text (`# %% [markdown]`
                                                            starts a markdown cell)

Standard library only: the same bytes on every machine, without Jupyter installed.
"""
import json
import sys
from pathlib import Path

KERNEL = {'display_name': 'Python 3 (ipykernel)', 'language': 'python', 'name': 'python3'}


def cells_of(text: str) -> list[dict]:
    cells: list[dict] = []
    for chunk in text.split('# %%')[1:]:
        head, _, body = chunk.partition('\n')
        kind = 'markdown' if '[markdown]' in head else 'code'
        source = body.strip('\n')
        if kind == 'markdown':
            source = '\n'.join(l[2:] if l.startswith('# ') else l.lstrip('#') for l in source.split('\n'))
        cells.append({'kind': kind, 'source': source})
    return cells


def notebook(cells: list[dict]) -> str:
    out = []
    for i, c in enumerate(cells, 1):
        cell = {'cell_type': c['kind'], 'id': f'c{i}', 'metadata': {}, 'source': c['source'].splitlines(keepends=True)}
        if c['kind'] == 'code':
            cell = {**cell, 'execution_count': None, 'outputs': []}
        out.append(cell)
    nb = {'cells': out, 'metadata': {'kernelspec': KERNEL, 'language_info': {'name': 'python'}}, 'nbformat': 4, 'nbformat_minor': 5}
    return json.dumps(nb, indent=1, ensure_ascii=False) + '\n'


def text_of(path: Path) -> str:
    nb = json.loads(path.read_text())
    parts = []
    for c in nb['cells']:
        src = ''.join(c['source'])
        if c['cell_type'] == 'markdown':
            parts.append('# %% [markdown]\n' + '\n'.join('# ' + l for l in src.split('\n')))
        else:
            parts.append('# %%\n' + src)
    return '\n\n'.join(parts) + '\n'


def main() -> int:
    if len(sys.argv) != 3 or sys.argv[1] not in ('text', 'write'):
        print(__doc__)
        return 2
    path = Path(sys.argv[2])
    if sys.argv[1] == 'text':
        print(text_of(path), end='')
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(notebook(cells_of(sys.stdin.read())))
    return 0


if __name__ == '__main__':
    sys.exit(main())
