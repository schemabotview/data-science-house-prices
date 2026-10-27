import type { Section } from '../types'

export const whatANotebookIs: Section = {
  id: 'what-a-notebook-is',
  title: 'What a notebook is',
  scene: 'setup-notebook',
  narration:
    "Before the first cell, it is worth knowing what a notebook actually is, because it explains almost every surprise you will meet in one. A notebook is three programs and one file. Number one is the browser, running JupyterLab. It draws the cells, and when you run one, it sends that cell's code away. It does not run Python itself. Number two is the Jupyter server, a program on your machine. It passes the code along, carries the result back, and saves the notebook to disk. Number three is the kernel: one Python process, started when the notebook opens. It runs each cell it is sent, and here is the important part: it stays alive between cells. When cell one creates homes, the DataFrame stays in the kernel's memory, so every later cell can use it, without reading the file again. jupyter kernelspec list shows the kernel we are using, the python three kernel inside this project's own dot venv. Number four is the file. A notebook dot ipynb is plain JSON. On the right is cell one exactly as it was saved, printed by the lab: its cell type, its execution count, one, its output, the tuple one thousand four hundred and sixty, ten, and its source, line by line. So the file holds what you typed, and a record of what happened when it ran. The numbers in square brackets are that record: the order the kernel ran cells in. They are not line numbers, and they are not guaranteed to go top to bottom. Two sections from now, that difference produces a wrong answer, on purpose.",
}
