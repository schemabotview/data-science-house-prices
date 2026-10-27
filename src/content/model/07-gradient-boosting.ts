import type { Section } from '../types'

export const gradientBoosting: Section = {
  id: 'gradient-boosting',
  title: "Gradient boosting, and the leaderboard",
  scene: 'model-boosting',
  narration:
    "Gradient boosting is one of the most successful methods in practice for tables of data like ours, and the side pane gives the idea in three steps. A small tree makes its predictions, with errors. A second tree is trained to predict those errors, and its answer is used to correct the first, a little. A third tree predicts what is still wrong, and so on, a hundred times. Each tree is weak, and together they can follow almost any shape. Cell twenty five fits scikit learn's histogram based gradient boosting regressor, with a seed, and then puts every model so far on one leaderboard, scored on the same test houses. The median guess, fifty nine thousand pounds. The line on size, thirty two thousand. The decision tree, thirty four. The log model, twenty two thousand. Gradient boosting, twenty one thousand two hundred and ninety two. And the winner: the plain linear model with every feature, nineteen thousand nine hundred and twenty five pounds. That is a real result, and an important one. Boosting is not magic. These prices were built by adding effects together, which is exactly the shape a linear model assumes, so the linear model fits it best and boosting has nothing extra to find. On messier real data, with thresholds and interactions, the order would often flip. You find out by measuring, never by reputation.",
}
