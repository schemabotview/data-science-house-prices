import type { Section } from '../types'

export const tests: Section = {
  id: 'tests',
  title: "Tests: every fault, guarded",
  scene: 'ship-tests',
  narration:
    "The cleaning course found seven faults and fixed each one. A test makes sure each fix stays fixed. The editor shows tests slash test clean dot py, written for pytest, which this section adds to the project as a pinned development tool. At the top is one perfectly ordinary sale, written out as a dictionary, and a helper called raw that builds a one row raw export, with any changes you ask for. Each test then plants exactly one fault and asserts what clean must make of it. The highlighted one gives the price as pound two hundred and fifteen thousand, with the comma, and asserts that clean turns it into the number two hundred and fifteen thousand. The side pane lists every test beside the fault it guards and the section where we first met it: the day first dates, the square metre batch, the empty garages, the duplicates, the ten thousand pound transfer, and the area spellings. That last test is parametrised: pytest runs it three times, once for each spelling. In the terminal, pytest dash q runs them all: nine passed. Now suppose, months from now, someone tidies up clean and accidentally drops the comma handling. They will not find out from a wrong chart, weeks later. pytest will fail on the very next run, naming the fault that came back.",
}
