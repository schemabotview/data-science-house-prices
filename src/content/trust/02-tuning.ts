import type { Section } from '../types'

export const tuning: Section = {
  id: 'tuning',
  title: "Tuning: a grid of settings, judged fairly",
  scene: 'trust-tuning',
  narration:
    "Gradient boosting lost to the linear model, but it ran on its default settings. Perhaps it just needs tuning. Cell twenty nine sets up a grid search. It tries every combination of two settings: the learning rate, how much each new tree is allowed to correct, at three values, and the maximum number of leaves per tree, at three values. Nine combinations, each scored with the same five fold cross validation as before: forty five fits, all on the training rows. Cell thirty lists the best four. The winner is a learning rate of zero point one with at most seven leaves, with a cross validated error of twenty two thousand nine hundred and ten pounds. Cell thirty one puts it beside the linear model, both on the folds and on the test set. On the folds, the linear model wins, twenty thousand nine hundred and eighty one pounds against twenty two thousand nine hundred and ten. And on the test set, looked at once now that the choice is made, the linear model wins again, nineteen thousand nine hundred and twenty five against twenty thousand eight hundred and seventy four. Tuning improved boosting. It did not change the decision. And the decision was made on the folds, before the test set was consulted, which is what makes the test score still worth believing. The model to ship is the linear one.",
}
