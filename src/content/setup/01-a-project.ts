import type { Section } from '../types'

export const aProject: Section = {
  id: 'a-project',
  title: 'A project, its own Python, four tools',
  scene: 'setup-venv',
  narration:
    "Every data project starts with two things: the data, and the tools to read it. Our folder is called house prices, and it arrives with exactly that. The terminal lists it: a data folder holding one file, homes dot csv, every house sold in the town of Millbrook over almost six years, and a file called pyproject dot toml, open in the editor. Its last block is a dependency group named notebook: four tools, each pinned to an exact version. pandas, for tables. NumPy, the fast arrays pandas is built on. matplotlib, for charts. And JupyterLab, the notebook we will work in. Back in the terminal, python three point fifteen, dash m, venv, makes the project its own Python in a folder called dot venv, and source activates it. Then one command reads the group and installs all four, into this project only: pip install, dash dash group, notebook. The side pane shows where they land: the virtual environment's site packages, nowhere else on the machine. The last two commands ask the tools themselves which versions arrived, and they match the pins exactly. That is the reason to pin. A later install could pick up a newer pandas that prints a table slightly differently, or changes a default, and a number in this course would quietly stop matching your screen. With the pins, every output you see here is one you can reproduce. Notice the project is not a Python package yet: no package folder, nothing to import. It is a folder with data and tools. It becomes a package in the last course, once there is code worth packaging.",
}
