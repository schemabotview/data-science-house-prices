import type { Section } from '../types'

export const executionOrder: Section = {
  id: 'execution-order',
  title: 'Execution order: a stale answer',
  scene: 'setup-stale',
  narration:
    "This section produces a wrong answer, on purpose, because every notebook user meets it eventually. Cell five keeps the big houses: homes over two thousand five hundred square feet, in a new DataFrame called big. Cell six asks how many there are, with len: one hundred and fifty four. Except that is not the answer to the question on screen. Look at the counts in the gutter. Cell five ran fifth, and cell six shows seven, not six. The side pane lays out what the kernel actually ran. Cell five first ran with an earlier version of its text: over two thousand. Cell six counted those homes, one hundred and fifty four. Then cell five was edited to two thousand five hundred, and never run again, so the kernel never saw the edit. Cell six ran once more, as count seven, and counted the same old big. The notebook now shows code that says one thing next to a result that comes from another. Nothing warned us. The fix is to stop trusting the order things happened to run in. In JupyterLab's Kernel menu, Restart Kernel and Run All Cells throws away everything in memory, and runs every cell top to bottom, once. The table at the bottom compares the two: as run, one hundred and fifty four, after a restart, thirty eight. Thirty eight is the right answer for two thousand five hundred square feet. The rule for the whole course: before you believe a result, or share a notebook, restart and run all. The counts should read one, two, three, in order, and from the next section on, they will.",
}
