import type { Section } from '../types'

export const aStraightLine: Section = {
  id: 'a-straight-line',
  title: "A straight line on size",
  scene: 'model-line',
  narration:
    "The first real model uses the strongest single feature we found: size. Cell fifteen fits a linear regression of price on sqft, using the training rows only. Fitting means choosing the straight line through the data that is, in a sense we will look at next, closest to all the points. The model learns two numbers. The intercept, about seventy seven thousand pounds, is where the line meets zero square feet. And the slope, one hundred and thirty one pounds and ten pence, is the price of each extra square foot. Then the cell predicts the test houses and scores them: a mean absolute error of thirty two thousand, six hundred and forty eight pounds. Size alone has cut the baseline's error nearly in half. The next cell draws it, on the right: the test houses as a scatter, and the fitted line in red, running through the middle of the cloud. Notice what the line cannot do. Two houses of the same size, one in Riverside and one in Eastfield, get exactly the same prediction, because the model has only ever been shown size. Every point above the line is a house worth more than its size suggests, and every point below, less. The distance from each point to the line is that house's error. How does fit choose the line? That is the next section.",
}
