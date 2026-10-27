import type { Section } from '../types'

export const notebookToModule: Section = {
  id: 'notebook-to-module',
  title: "Notebook to module",
  scene: 'ship-module',
  narration:
    "Everything so far lives in notebooks, which are perfect for asking questions and poor for running answers. A function defined in a notebook exists only inside one kernel. It cannot be imported by a script, tested, or used by a web service. So the last course moves the answers out of the notebooks and into a package, and the frame changes with it, from the notebook to the editor and terminal. The first thing to move is the cleaning. The editor shows house underscore prices slash clean dot py: the same clean function the cleaning course built in cell nineteen, now in a file, with one improvement, the area is title cased here too, so Old town can never come back. Underneath, a second function, load sales, reads an agency export and cleans it in one call. pyproject dot toml grows up to match: a build system section, the package's own dependencies, and the name of the package. Then pip install dash e dot installs the project into its own environment in editable mode, so any change to the file takes effect immediately. The terminal proves it works: a one line Python command imports load sales from the package, reads the raw export, and prints fourteen hundred and fifty three rows by ten columns. The notebook's answer, now from a module that anything can import.",
}
