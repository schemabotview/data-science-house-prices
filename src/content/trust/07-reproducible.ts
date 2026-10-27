import type { Section } from '../types'

export const reproducible: Section = {
  id: 'reproducible',
  title: "Reproducible: same code, same numbers",
  scene: 'trust-reproducible',
  narration:
    "The last check is about the work itself rather than the model: could someone else get exactly these numbers? Cell forty one prints the versions that produced every result in this course: Python three point fifteen point one, pandas three point one, NumPy two point five point four, scikit learn one point nine point one, all pinned in pyproject dot toml. A different version can change a default, a tie break, or a random number stream, and the numbers shift. The side pane lists the other half: every random step in this notebook was given a seed. The train test split, the cross validation folds, the trees, the boosting and the permutation importance all used random state fourteen sixty. And cell forty two scores the model once more: nineteen thousand nine hundred and twenty five pounds, exactly as before. That is not luck. Every notebook in this course, from the first cell of explore dot ipynb to here, is re run from top to bottom by the course's own checks, with a fresh kernel, a Restart and Run All, on every change, and every number on every screen is compared with what that run printed. Pins, seeds and a clean top to bottom run are what turn a notebook from something that worked once into a result other people can check. Next: taking it out of the notebook.",
}
