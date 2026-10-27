#!/usr/bin/env python3
"""Make the next spine step: copy its parent's project, append notebook cells, write step.json.

  python3 scripts/step.py <course/NN-name> --from <course/NN-name> --nb <notebook> [--new] [opts] < cells.txt

cells.txt is scripts/nb.py's text form (`# %%` between cells). The cells are APPENDED to the
parent's notebook, or start a new notebook with --new. step.json gets `from`, `changes` (the notebook,
plus --change paths), `notebook`, and any of:

  --volatile                 timings in the output (digits masked when compared)
  --produces data/x.csv      a file the notebook writes, kept in the project and checked by the replay
  --change path              another path this step changes (copy the file in yourself first)
  --replace                  replace the notebook's cells instead of appending

An authoring aid only: spine.py is what checks the result.
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPINE = ROOT / 'spine'
NB = [sys.executable, str(ROOT / 'scripts' / 'nb.py')]


def main() -> int:
    a = argparse.ArgumentParser()
    a.add_argument('step')
    a.add_argument('--from', dest='parent', required=True)
    a.add_argument('--nb', required=True)
    a.add_argument('--new', action='store_true')
    a.add_argument('--replace', action='store_true')
    a.add_argument('--volatile', action='store_true')
    a.add_argument('--produces', action='append', default=[])
    a.add_argument('--change', action='append', default=[])
    args = a.parse_args()
    step, parent = SPINE / args.step, SPINE / args.parent
    if (step / 'project').exists():
        shutil.rmtree(step / 'project')
    step.mkdir(parents=True, exist_ok=True)
    shutil.copytree(parent / 'project', step / 'project')
    nb = step / 'project' / args.nb
    added = sys.stdin.read()
    before = '' if args.new or args.replace or not nb.exists() else subprocess.run([*NB, 'text', str(nb)], capture_output=True, text=True, check=True).stdout
    text = (before.rstrip('\n') + '\n\n' if before else '') + added.strip('\n') + '\n'
    subprocess.run([*NB, 'write', str(nb)], input=text, text=True, check=True)
    config: dict = {'from': args.parent, 'changes': [args.nb, *args.change], 'notebook': args.nb}
    if args.volatile:
        config['volatile'] = True
    if args.produces:
        config['produces'] = args.produces
    (step / 'step.json').write_text(json.dumps(config) + '\n')
    print(f'made {args.step}: {json.dumps(config)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
