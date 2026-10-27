#!/usr/bin/env bash
# Install the course's pinned interpreters into /usr/local, as on a learner's machine:
# python, python3.15 (GIL) and python3.15t (free-threaded), all CPython 3.15.1.
# Usable as a cloud environment's setup script. Needs network access to PyPI and GitHub.
#
# The ORDER is load-bearing. Both trees ship bin/python3.15; in the free-threaded one it is a
# symlink to python3.15t. Copying the regular tree over it writes THROUGH that link and replaces
# the free-threaded binary, so both names end up with the GIL on, silently. The two binaries are
# therefore placed by name, after the trees.
set -euo pipefail
PIN=3.15.1
if [ "$(python3.15t -c 'import platform,sys; print(platform.python_version(), sys._is_gil_enabled())' 2>/dev/null)" = "$PIN False" ] &&
   [ "$(python -c 'import platform,sys; print(platform.python_version(), sys._is_gil_enabled())' 2>/dev/null)" = "$PIN True" ]; then
  echo "python $PIN already installed"; exit 0
fi
work=$(mktemp -d)
python3 -m pip download "uv==0.13.5" --no-deps -q -d "$work"   # 0.11.x does not list 3.15.1
python3 -m zipfile -e "$work"/uv-*.whl "$work/uv"
uv=$(find "$work/uv" -path '*data/scripts/uv'); chmod +x "$uv"
"$uv" python install "$PIN" "$PIN+freethreaded" --install-dir "$work/py"
regular="$work/py/cpython-$PIN-linux-x86_64-gnu" ft="$work/py/cpython-$PIN+freethreaded-linux-x86_64-gnu"
cp -a "$ft/." /usr/local/
cp -a "$regular/." /usr/local/
rm -f /usr/local/bin/python3.15 /usr/local/bin/python3.15t
cp -a "$regular/bin/python3.15" /usr/local/bin/python3.15
cp -a "$ft/bin/python3.15t" /usr/local/bin/python3.15t
ln -sf python3.15 /usr/local/bin/python
# uv links python3.15 into ~/.local/bin, AHEAD of /usr/local/bin on PATH: a replay once wrote a
# scratch path into pyvenv.cfg through one.
rm -f ~/.local/bin/python3.15 ~/.local/bin/python3.15t
rm -rf "$work"
python -c 'import platform,sys; assert (platform.python_version(), sys._is_gil_enabled()) == ("'$PIN'", True)'
python3.15t -c 'import platform,sys; assert (platform.python_version(), sys._is_gil_enabled()) == ("'$PIN'", False)'
echo "python $PIN and ${PIN}t installed in /usr/local"
