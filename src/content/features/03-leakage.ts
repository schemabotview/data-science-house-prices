import type { Section } from '../types'

export const leakage: Section = {
  id: 'leakage',
  title: "Leakage: the perfect score that is a lie",
  scene: 'features-leakage',
  narration:
    "This is the most important mistake in machine learning, and it looks like success. On the left is a feature that seems reasonable. In the shape course we found that price per square foot differs by area, so why not give the model price per square foot? The cell builds two features: the log of size, and the log of price per square foot. Look at line four. Price per square foot is price divided by size. It is built from y, the very thing we are trying to predict. The table shows what happens on the test set. R squared measures how much of the variation in price a model explains, where one point zero is perfect. Size alone explains zero point seven one. Add price per square foot, and the score is exactly one point zero. Perfect. And completely useless. Below, a house we actually want to value: we know its size, fifteen hundred square feet. Its price per square foot? To know that, we would need its price, which is what we are trying to find. That is leakage: information about the answer getting into the features. It always looks like brilliant performance, and it always fails the moment the model meets a real house. The table at the bottom lists quieter versions of the same mistake, and the question that catches all of them: would I know this value at the moment I need the prediction?",
}
