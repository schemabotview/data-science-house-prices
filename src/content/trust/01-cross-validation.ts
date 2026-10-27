import type { Section } from '../types'

export const crossValidation: Section = {
  id: 'cross-validation',
  title: "Cross-validation: five exams, no peeking",
  scene: 'trust-cv',
  narration:
    "We have a winning model, and one test score. Two problems remain. One test set is a single exam, and a single exam can be lucky. And worse, every time we look at the test score to choose between models, a little of the test set leaks into our choices, until it is no longer an honest exam at all. Cross validation fixes both, using only the training rows. Cell twenty eight splits the training set into five folds, shuffled with a fixed seed. Then it trains the model five times. Each time, four fifths are used for training, and the remaining fifth is the exam. Every training row is examined exactly once. The side pane lists the five scores: between about twenty thousand and twenty two thousand pounds. Their mean, twenty thousand nine hundred and eighty one pounds, is the estimate of how the model will do on new houses, and their spread, about nine hundred pounds, says how much that estimate wobbles from one exam to another. The test score from the last course, nineteen thousand nine hundred and twenty five, sits comfortably inside that range, which is reassuring. From now on, every decision, which model, which settings, is made on these folds. The test set stays locked, for one final score at the very end.",
}
