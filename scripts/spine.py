#!/usr/bin/env python3
"""Replay every spine step and compare its terminal transcript and notebook outputs with what the
code really prints.

Ported from python-expense-tracker's spine.py; the terminal half is unchanged. What is new here is
the NOTEBOOK half: a step with `"notebook": "notebooks/explore.ipynb"` executes that notebook in a
real Jupyter kernel (scripts/run_notebook.py) and keeps every cell's count and outputs in the step's
cells.json, which the notebook frame (src/scenes/notebook.ts) draws. The kernel runs in a venv
CACHED per pyproject.toml (~/.cache/house-prices-spine/<hash>/), built once with
`pip install --group notebook`: a fresh 120-package install per step would make a replay take an
hour. Its path is rewritten to /home/ana/house-prices/.venv, where the learner's lives.

  {"notebook": "notebooks/explore.ipynb"}       run it top to bottom (Restart & Run All)
  {"notebook": …, "sequence": [1, 2, [3, "src"], 4, 4]}
                                                run cells in THIS order — a number runs the cell as
                                                it stands, [n, "source"] runs an earlier text of it
                                                (edited later, never re-run: a stale result, made
                                                for real). See run_notebook.py.

A step has a session.txt, a notebook, or both. Notebooks are stored CLEAN (scripts/nb.py): no
outputs, so the lineage check sees only cells.

The spine is the course's one project, `house-prices`, kept as real files: one snapshot per step in
spine/<course>/<step>/project/. Each step's session.txt is the terminal pane a scene shows — `$ `
lines are commands, everything else is their output. Scenes import these files with Vite's `?raw`,
so a frame can only show what this script has verified.

  python3 scripts/spine.py            check every step (exit 1 on any difference)
  python3 scripts/spine.py --write    re-run every step and rewrite its session.txt / captures
  python3 scripts/spine.py hold/03    only the steps whose path starts with an argument

Each step is replayed in a fresh temp copy named expense-tracker, inside a temp "home" directory, by
ONE bash process, so `cd` and `source .venv/bin/activate` carry from command to command as they do
in a real terminal. A command followed by `>>> ` (or `(Pdb) `) lines is an interactive session: it is run in a
pseudo-terminal and fed those lines (the app's own `expense> ` prompt too); `... ` continuation lines are typed without their indentation (the
3.13+ REPL indents for you) and a bare `...` ends a block. Temp paths are rewritten to /home/ana/expense-tracker, the path the
frames show. Run it with the course's pinned interpreter first on PATH as `python` (see CLAUDE.md).

THE SPINE IS CUMULATIVE. Every step is the step before it plus the changes it declares, and this
script fails a step whose project differs from its parent's anywhere it did not declare — so nothing
written for the app is thrown away or edited silently. Each step.json says where it sits:

  {"first": true}               starts the chain (2.1: an empty folder)
  {"from": "start/02-main",     continues that step; `changes` lists every path it adds, edits or
   "changes": ["main.py"]}      removes (a directory covers everything under it). A declared path
                                that did not change fails too: the list is the section's diff.
  {"lab": true}                 a standalone lab outside the chain: the real output a concept scene
                                shows (Course 1, and every full-scene detour)

A failure branch (run the wrong version, then fix it) is two steps with the same `from`.
__pycache__, .venv and *.pyc are never compared.

step.json (other keys, all optional):
  {"start": "home"}             start in the directory ABOVE the project (default: the project)
  {"venv": true}                create .venv before replaying and start with it activated
  {"capture": ["path", ...]}    files the session creates that a scene shows; saved to captured/
  {"project": "name"}           the folder's name (default expense-tracker): a lab is not the spine
  {"volatile": true}            output carries ids or timings that change every run: compared with every
                                digit masked, so the text and shape are checked but not the numbers
  {"setup": ["cmd", ...]}       run silently before the transcript (after the venv): the state a step
                                starts from, e.g. the project already installed with pip install -e
"""
import hashlib
import json
import os
import pty
import re
import select
import shlex
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'spine'
# Every output in the course is produced on this interpreter (COURSE-PLAN.md, "Python
# version"). A different `python` changes the banner, pyvenv.cfg and error text, so it is refused up
# front rather than reported as a hundred transcript differences.
PINNED = 'Python 3.15.1'
# Sessions call the interpreter by all of these names, and a venv records where it came from
# (pyvenv.cfg `home`, sys.base_prefix) — so every name must be the SAME install, in /usr/local as on a
# learner's machine. Checking `python` alone once let `python3.15` resolve to a uv link elsewhere and
# put a scratch path into a transcript.
INTERPRETERS = ('python', 'python3.15', 'python3.15t')
PREFIX = '/usr/local'
IGNORED = {'__pycache__', '.venv', '.ipynb_checkpoints'}
SHOWN_HOME = '/home/ana'
PROJECT = 'house-prices'
ANSI = re.compile(r'\x1b\[[0-9;?]*[@-~]|\x1b[=>]|\r')
MARK = '__SPINE_MARK__'
APP_PROMPT = 'house-prices> '
RUNNER = Path(__file__).resolve().parent / 'run_notebook.py'
KERNELS = Path(os.environ.get('SPINE_KERNELS', Path.home() / '.cache' / 'house-prices-spine'))
SHOWN_VENV = f'{SHOWN_HOME}/{PROJECT}/.venv'


def kernel_env(pyproject: Path, env: dict) -> Path:
    """The cached venv a notebook runs in: one per pyproject.toml, with its `notebook` group."""
    key = hashlib.sha256(pyproject.read_bytes()).hexdigest()[:12]
    venv = KERNELS / key
    if not (venv / '.ready').exists():
        shutil.rmtree(venv, ignore_errors=True)
        KERNELS.mkdir(parents=True, exist_ok=True)
        subprocess.run(['python', '-m', 'venv', str(venv)], env=env, check=True)
        subprocess.run([str(venv / 'bin' / 'pip'), 'install', '-q', '--group', 'notebook'], cwd=pyproject.parent, env=env, check=True)
        (venv / '.ready').write_text('')
    return venv


def run_notebook(project: Path, config: dict, env: dict) -> list:
    venv = kernel_env(project / 'pyproject.toml', env)
    nb = project / config['notebook']
    kenv = {**env, 'PATH': f"{venv / 'bin'}:{env['PATH']}", 'VIRTUAL_ENV': str(venv), 'PYDEVD_DISABLE_FILE_VALIDATION': '1',
            # A kernel needs a writable runtime dir; inside the temp HOME it is thrown away with it.
            'JUPYTER_RUNTIME_DIR': str(project.parent / '.jupyter-runtime')}
    r = subprocess.run([str(venv / 'bin' / 'python'), str(RUNNER), str(nb), json.dumps(config.get('sequence'))],
                       cwd=nb.parent, env=kenv, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(f'✗ {nb}: the notebook run failed\n{r.stderr}')
    text = r.stdout.replace(str(venv), SHOWN_VENV).replace(str(venv.resolve()), SHOWN_VENV)
    return json.loads(text)


def commands(session: str) -> list[tuple[str, list[str]]]:
    """Split a transcript into (command, REPL input lines) pairs."""
    out: list[tuple[str, list[str]]] = []
    for line in session.splitlines():
        if line.startswith('$ '):
            out.append((line[2:], []))
        elif out and (line.startswith('>>> ') or line == '>>>'):
            out[-1][1].append(line[4:])
        elif out and (line.startswith('... ') or line == '...'):
            # A continuation line. Python 3.13+'s REPL indents a block for you, so the line is typed
            # WITHOUT the indentation the transcript shows (or it would be indented twice); a bare
            # `...` types the empty line that ends the block.
            out[-1][1].append(line[4:].lstrip())
        elif out and line.startswith('(Pdb) '):
            out[-1][1].append(line[6:])
        elif out and line.startswith(APP_PROMPT):
            # The app's own prompt (input("expense> "), Course 4 on): typed into the pty like a REPL line.
            out[-1][1].append(line[len(APP_PROMPT):])
    return out


def repl(cwd: Path, env: dict, inputs: list[str], argv: list[str]) -> str:
    """Run the REPL command (`python`, `python -q`) in a pty, type each input line, return the screen."""
    pid, fd = pty.fork()
    if pid == 0:
        os.chdir(cwd)
        os.execvpe(argv[0], argv, {**env, 'TERM': 'xterm-256color'})
    screen = b''

    def drain(timeout: float) -> None:
        nonlocal screen
        end = time.time() + timeout
        while time.time() < end:
            ready, _, _ = select.select([fd], [], [], 0.05)
            if ready:
                try:
                    chunk = os.read(fd, 4096)
                except OSError:
                    return
                if not chunk:
                    return
                screen += chunk
                end = time.time() + 0.3

    drain(5)
    for line in inputs:
        os.write(fd, line.encode() + b'\r')
        drain(5)
    for _ in range(50):
        if os.waitpid(pid, os.WNOHANG)[0]:
            break
        time.sleep(0.1)
    else:
        os.kill(pid, 9)
        os.waitpid(pid, 0)
        screen += b'\n[the REPL did not exit: check the >>> lines in session.txt]'
    text = ANSI.sub('', screen.decode(errors='replace'))
    return '\n'.join(l.rstrip() for l in text.split('\n')).strip('\n')


def replay(step: Path) -> tuple[str | None, dict[str, str], list | None]:
    config = config_of(step)
    has_session = (step / 'session.txt').exists()
    session = (step / 'session.txt').read_text() if has_session else ''
    with tempfile.TemporaryDirectory() as tmp:
        home = Path(tmp) / 'home'
        project = home / config.get('project', PROJECT)
        home.mkdir()
        if (step / 'project').exists():
            shutil.copytree(step / 'project', project)
        # pip's "a new release is available" notice depends on the date, not the code: switched off.
        env = {**os.environ, 'HOME': str(home), 'NO_COLOR': '1', 'PYTHON_COLORS': '0', 'TERM': 'dumb', 'PS1': '',
               'PIP_DISABLE_PIP_VERSION_CHECK': '1',
               # The temp HOME would give pip an empty cache every step: keep the real one.
               'PIP_CACHE_DIR': os.environ.get('PIP_CACHE_DIR', str(Path.home() / '.cache' / 'pip'))}
        if config.get('venv'):
            project.mkdir(exist_ok=True)
            subprocess.run(['python', '-m', 'venv', '.venv'], cwd=project, env=env, check=True)
            env['PATH'] = f"{project / '.venv' / 'bin'}:{env['PATH']}"
            env['VIRTUAL_ENV'] = str(project / '.venv')
        cwd = home if config.get('start') == 'home' else project
        for cmd in config.get('setup', []):
            subprocess.run(['bash', '-c', cmd], cwd=project, env=env, check=True, capture_output=True)
        blocks: list[str] = []
        for cmd, inputs in commands(session):
            if inputs:
                output = repl(cwd, env, inputs, shlex.split(cmd))
            else:
                script = f'cd {cwd!s}\n{{ {cmd}\n}} 2>&1\necho "{MARK}$PWD"\n'
                state = home / '.spine-state'
                if state.exists():
                    script = state.read_text() + script
                r = subprocess.run(['bash', '-c', script + f'declare -p VIRTUAL_ENV PATH 2>/dev/null > {state}'],
                                   env=env, capture_output=True, text=True)
                text = r.stdout
                output, _, after = text.partition(MARK)
                if after:
                    cwd = Path(after.split('\n')[0])
                output = output.rstrip('\n')
                if state.exists():
                    saved = state.read_text()
                    state.write_text(saved.replace('declare -x', 'export').replace('declare --', 'export') + '\n')
            blocks.append(f'$ {cmd}' + (f'\n{output}' if output else ''))
        transcript = '\n'.join(blocks)
        cells = run_notebook(project, config, env) if config.get('notebook') else None
        captured = {name: (project / name).read_text() for name in config.get('capture', [])}
        # Files the notebook WRITES (a cleaned dataset) belong to the project from this step on:
        # returned under 'project/' so --write keeps them and a check compares them.
        captured.update({f'project/{name}': (project / name).read_text() for name in config.get('produces', [])})
    real = str(home)
    fix = lambda s: s.replace(real, SHOWN_HOME).replace(str(Path(tmp).resolve() / 'home'), SHOWN_HOME)
    if cells is not None:
        cells = json.loads(fix(json.dumps(cells, ensure_ascii=False)))
    text = fix(transcript).rstrip('\n') + '\n' if has_session else None
    return text, {k: fix(v) for k, v in captured.items()}, cells


def cells_text(cells: list) -> str:
    return json.dumps(cells, indent=1, ensure_ascii=False) + '\n'


def masked(text: str, step: Path) -> str:
    """For a volatile step, hide the numbers that legitimately change from run to run."""
    config = config_of(step)
    if not config.get('volatile'):
        return text
    # A memory address (an object's repr) differs in its hex LETTERS too: mask it whole first.
    return re.sub(r'\d+(?:[.,]\d+)*', '#', re.sub(r'0x[0-9a-f]+', '0x#', text))


def config_of(step: Path) -> dict:
    return json.loads((step / 'step.json').read_text()) if (step / 'step.json').exists() else {}


def files(step: Path) -> dict[str, bytes]:
    """A step's project as {relative path: bytes}, without caches and the venv."""
    root = step / 'project'
    if not root.exists():
        return {}
    return {
        p.relative_to(root).as_posix(): p.read_bytes()
        for p in sorted(root.rglob('*'))
        if p.is_file() and not IGNORED & set(p.relative_to(root).parts) and p.suffix != '.pyc'
    }


def lineage(step: Path) -> list[str]:
    """Why this step is not its parent plus its declared changes (empty when it is)."""
    name = step.relative_to(ROOT)
    config = config_of(step)
    kinds = [k for k in ('first', 'from', 'lab') if config.get(k)]
    if len(kinds) != 1:
        return [f'{name}: step.json needs exactly one of "first", "from", "lab" (has {kinds or "none"})']
    if 'from' not in kinds:
        return [f'{name}: "changes" only means something with "from"'] if config.get('changes') else []
    parent = ROOT / config['from']
    if not (parent / 'step.json').exists():
        return [f'{name}: "from" names {config["from"]}, which is not a step']
    if config_of(parent).get('lab'):
        return [f'{name}: "from" names a lab, which is outside the chain']
    changes = config.get('changes') or []
    # A file the notebook writes (`produces`) is the run's to check, not the diff's.
    produced = config.get('produces', [])
    if not changes:
        return [f'{name}: "from" without "changes" — a step that changes nothing is not a section']
    under = lambda path, c: path == c or path.startswith(c.rstrip('/') + '/')
    covered = lambda path: any(under(path, c) for c in changes + produced)
    before, after = files(parent), files(step)
    differs = {path for path in before.keys() | after.keys() if before.get(path) != after.get(path)}
    out = [f'{name}: {path} differs from {config["from"]} but is not in "changes"' for path in sorted(differs) if not covered(path)]
    out += [f'{name}: "changes" lists {c}, which did not change' for c in changes if not any(under(p, c) for p in differs)]
    return out


def main() -> int:
    write = '--write' in sys.argv
    if subprocess.run([sys.executable, str(Path(__file__).parent / 'generate_data.py'), '--check']).returncode:
        print('✗ data/ is not what the seed produces: the spine copies it, so fix that first')
        return 1
    for name in INTERPRETERS:
        probe = 'import sys, platform; print("Python " + platform.python_version(), sys.base_prefix)'
        try:
            version, _, prefix = subprocess.run([name, '-c', probe], capture_output=True, text=True).stdout.strip().partition(' /')
        except FileNotFoundError:
            version, prefix = '', ''
        prefix = '/' + prefix if prefix else ''
        if version != PINNED or prefix != PREFIX:
            print(f'✗ `{name}` is {version or "missing"} from {prefix or "?"}, not {PINNED} from {PREFIX}: install the pin into {PREFIX} (CLAUDE.md)')
            return 1
    only = [a for a in sys.argv[1:] if not a.startswith('--')]
    every = sorted(p.parent for p in ROOT.glob('*/*/step.json'))
    steps = [s for s in every if not only or any(str(s.relative_to(ROOT)).startswith(o) for o in only)]
    problems = 0
    # The chain is checked over EVERY step, whatever was asked for: a filtered run must not hide a
    # parent edited out from under its children.
    for problem in (p for s in every for p in lineage(s)):
        problems += 1
        print(f'✗ {problem}')
    # Every step's data/ is the generated data, byte for byte: a snapshot edited by hand would teach
    # numbers the seed never produced.
    data = Path(__file__).resolve().parent.parent / 'data'
    for s in every:
        for f in sorted((s / 'project' / 'data').glob('*.csv')):
            if not (data / f.name).exists():
                continue  # written by a notebook (`produces`): checked against its run instead
            if f.read_bytes() != (data / f.name).read_bytes():
                problems += 1
                print(f'✗ {s.relative_to(ROOT)}: data/{f.name} differs from the generated data/')
    if problems and write:
        print('✗ the chain is broken: fix step.json or the snapshots before rewriting transcripts')
        return 1
    for step in steps:
        transcript, captured, cells = replay(step)
        name = step.relative_to(ROOT)
        if write:
            if transcript is not None:
                (step / 'session.txt').write_text(transcript)
            if cells is not None:
                (step / 'cells.json').write_text(cells_text(cells))
            for file, text in captured.items():
                target = step / file if file.startswith('project/') else step / 'captured' / file
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(text)
            print(f'wrote {name}')
            continue
        import difflib
        for real, file in ((transcript, 'session.txt'), (cells_text(cells) if cells is not None else None, 'cells.json')):
            if real is None:
                continue
            expected = (step / file).read_text() if (step / file).exists() else ''
            if masked(real, step) != masked(expected, step):
                problems += 1
                print(f'✗ {name}: {file} differs from a real run')
                sys.stdout.writelines(difflib.unified_diff(expected.splitlines(True), real.splitlines(True), file, 'real run'))
        for file, text in captured.items():
            saved = step / file if file.startswith('project/') else step / 'captured' / file
            if not saved.exists() or saved.read_text() != text:
                problems += 1
                print(f'✗ {name}: {saved.relative_to(step)} differs from a real run')
    if not write:
        print(f"{'✗' if problems else '✓'} {len(steps)} spine step(s) replayed, {problems} problem(s)")
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
