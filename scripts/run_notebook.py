"""Execute one notebook in a real Jupyter kernel and print its cells as JSON — the spine's notebook half.

Run by scripts/spine.py with the KERNEL venv's python (it imports nbformat and nbclient, which live
there, not in the system interpreter):

  <venv>/bin/python scripts/run_notebook.py <notebook.ipynb> '<sequence json>'

The sequence is the order cells were run in, as a learner ran them: `null` (every cell, top to
bottom: Restart & Run All), or a list whose entries are a cell number (1-based, run with its current
source) or `[number, "source"]` (run with an EARLIER source — the cell was edited afterwards and not
re-run, which is how a stale result is made for real, 2.5). A cell keeps the count and outputs of its
LAST run; one never run keeps `null` and no outputs.

Each output becomes {"type": "stream" | "result" | "error", ...}: a result keeps its text/plain and,
when it is a DataFrame, its HTML table parsed into {"columns", "index_name", "rows"} — so a scene
draws a `table` from what pandas really printed, never retyped. The cwd is the notebook's folder,
as in JupyterLab.
"""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

import nbformat
from nbclient import NotebookClient
from nbclient.util import run_sync

ANSI = re.compile(r'\x1b\[[0-9;?]*[@-~]')

# A figure's DATA, read back from matplotlib after the cell that drew it: the scene redraws it as a
# graphl-flow plot (sharp at 4K) from exactly what the kernel plotted. Run hidden (store_history off,
# so counts do not move); the inline backend is told to keep figures open until this has read them.
KEEP_FIGURES = '%config InlineBackend.close_figures = False'
READ_FIGURES = """
import json as _json, numpy as _np, matplotlib.pyplot as _plt
from matplotlib.patches import Rectangle as _Rect
from matplotlib.colors import to_hex as _to_hex
from matplotlib.collections import LineCollection as _Lines, PathCollection as _Paths
def _floats(v):
    try:
        return [round(float(x), 6) for x in _np.asarray(v, dtype=float)]
    except (TypeError, ValueError):
        return []
def _line(ax, l):
    # Through the line's own transform into data units: axvline keeps its y in AXES fractions.
    xy = _np.column_stack([_np.asarray(l.get_xdata(), dtype=float), _np.asarray(l.get_ydata(), dtype=float)])
    if len(xy) and l.get_transform() != ax.transData:
        xy = ax.transData.inverted().transform(l.get_transform().transform(xy))
    return {"x": _floats(xy[:, 0]) if len(xy) else [], "y": _floats(xy[:, 1]) if len(xy) else [], "label": l.get_label(),
            "color": _to_hex(l.get_color())}
_axes = []
for _f in map(_plt.figure, _plt.get_fignums()):
    for _a in _f.axes:
        _axes.append({
            "title": _a.get_title(), "xlabel": _a.get_xlabel(), "ylabel": _a.get_ylabel(),
            "xlim": _floats(_a.get_xlim()), "ylim": _floats(_a.get_ylim()),
            "bars": [_floats([r.get_x(), r.get_width(), r.get_y(), r.get_height()]) for r in _a.patches if isinstance(r, _Rect)],
            "lines": [_line(_a, l) for l in _a.lines],
            "points": [[_floats(p) for p in c.get_offsets()] for c in _a.collections if isinstance(c, _Paths) and len(c.get_offsets())],
            "segments": [[[_floats(p) for p in seg] for seg in c.get_segments()] for c in _a.collections if isinstance(c, _Lines)],
            "xticklabels": [t.get_text() for t in _a.get_xticklabels()],
        })
_plt.close("all")
print(_json.dumps(_axes))
"""


class Table(HTMLParser):
    """pandas' DataFrame HTML: <thead> rows of <th>, <tbody> rows of one index <th> then <td>s."""

    def __init__(self) -> None:
        super().__init__()
        self.head: list[list[str]] = []
        self.body: list[list[str]] = []
        self.part = ''
        self.row: list[str] | None = None
        self.cell: list[str] | None = None

    def handle_starttag(self, tag, attrs):
        if tag in ('thead', 'tbody'):
            self.part = tag
        elif tag == 'tr':
            self.row = []
        elif tag in ('th', 'td') and self.row is not None:
            self.cell = []

    def handle_endtag(self, tag):
        if tag in ('th', 'td') and self.cell is not None and self.row is not None:
            self.row.append(''.join(self.cell).strip())
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            (self.head if self.part == 'thead' else self.body).append(self.row)
            self.row = None

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)


def table_of(html: str) -> dict | None:
    if '<table' not in html or 'dataframe' not in html:
        return None
    t = Table()
    t.feed(html)
    if not t.head:
        return None
    # A named index prints a second header row: [name, '', '', …].
    index_name = t.head[1][0] if len(t.head) > 1 and not any(t.head[1][1:]) else ''
    return {'columns': t.head[0][1:], 'index_name': index_name, 'rows': t.body}


def outputs_of(cell) -> list[dict]:
    out = []
    for o in cell.get('outputs', []):
        kind = o['output_type']
        if kind == 'stream':
            out.append({'type': 'stream', 'name': o['name'], 'text': o['text']})
        elif kind in ('execute_result', 'display_data'):
            data = o.get('data', {})
            entry = {'type': 'result', 'text': data.get('text/plain', '')}
            table = table_of(data.get('text/html', ''))
            if table:
                entry['table'] = table
            if 'image/png' in data:
                entry['image'] = True
            out.append(entry)
        elif kind == 'error':
            out.append({'type': 'error', 'ename': o['ename'], 'evalue': o['evalue'],
                        'traceback': ANSI.sub('', '\n'.join(o['traceback']))})
    return out


def main() -> None:
    path = Path(sys.argv[1]).resolve()
    sequence = json.loads(sys.argv[2]) if len(sys.argv) > 2 else None
    nb = nbformat.read(path, as_version=4)
    order = sequence if sequence is not None else list(range(1, len(nb.cells) + 1))
    client = NotebookClient(nb, kernel_name='python3', timeout=600, allow_errors=True,
                            resources={'metadata': {'path': str(path.parent)}})
    ran = set()
    figures: dict[int, list] = {}

    def hidden(code: str) -> str:
        # Straight to the kernel client: execute_cell would write its outputs into the notebook.
        out: list[str] = []
        hook = lambda msg: out.append(msg['content'].get('text', '')) if msg['msg_type'] == 'stream' else None
        run_sync(client.kc.execute_interactive)(code, store_history=False, output_hook=hook, timeout=120)
        return ''.join(out)

    with client.setup_kernel():
        hidden(KEEP_FIGURES)
        for entry in order:
            number, source = (entry, None) if isinstance(entry, int) else entry
            cell = nb.cells[number - 1]
            if cell.cell_type != 'code':
                continue
            current = cell.source
            if source is not None:
                cell.source = source
            cell.outputs = []
            client.execute_cell(cell, number - 1)
            cell.source = current
            ran.add(number)
            if any('image/png' in o.get('data', {}) for o in cell.outputs):
                figures[number] = json.loads(hidden(READ_FIGURES) or '[]')
    cells = []
    for i, cell in enumerate(nb.cells, 1):
        if cell.cell_type != 'code':
            cells.append({'cell': i, 'markdown': cell.source})
            continue
        entry = {'cell': i, 'n': cell.get('execution_count') if i in ran else None, 'source': cell.source,
                 'outputs': outputs_of(cell) if i in ran else []}
        if i in figures:
            entry['figure'] = figures[i]
        cells.append(entry)
    print(json.dumps(cells, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
