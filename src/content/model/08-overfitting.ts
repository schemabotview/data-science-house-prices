import type { Section } from '../types'

export const overfitting: Section = {
  id: 'overfitting',
  title: "Overfitting: memorising is not learning",
  scene: 'model-overfitting',
  narration:
    "Why stop the decision tree at three levels? Let it ask more questions and it should get better. Cell twenty six tests that, fitting trees from depth one to depth twenty, and scoring each twice: on the training rows it learned from, and on the test rows it has never seen. The table shows a few, and the plot on the right shows all twenty. The training error falls steadily, and at depth twenty it is fifteen pounds. Fifteen pounds! The tree has asked so many questions that almost every training house sits in its own leaf, so it simply repeats each house's price back. The test error tells the truth. It falls at first, from forty seven thousand at depth one to about thirty thousand at depth six, and then it rises again, to thirty three and a half thousand at depth twenty. The deep tree has learned the noise of the particular houses it was shown, details that do not repeat in new houses. That is overfitting: memorising the training data instead of learning the pattern. The gap between the two curves is the warning sign, and it is exactly why the test set exists. Depth is one of many settings like this, called hyperparameters, and choosing them well, without wearing out the test set in the process, is where the next course begins.",
}
