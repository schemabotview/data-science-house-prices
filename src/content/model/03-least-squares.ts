import type { Section } from '../types'

export const leastSquares: Section = {
  id: 'least-squares',
  title: "How least squares fits a line",
  scene: 'model-least-squares',
  narration:
    "Out of every possible straight line, how does linear regression pick one? The answer is called least squares, and it is three steps. Step one: any line makes an error for each house, the actual price minus what the line says. The table shows four real test houses. One sold for thirty eight thousand pounds more than the line predicted, another for fifty three thousand less. Step two: square every error, take the mean, and then the square root, to get back to pounds. That is the root mean squared error. Squaring does two things. A miss above can no longer cancel a miss below, and a big miss counts far more than a small one: twice the error, four times the penalty. Step three: the best line is the one with the smallest root mean squared error. The plot shows that search done by brute force. The notebook tried every slope from one hundred to one hundred and eighty pounds per square foot, with its best intercept, and measured the error of each. The curve falls, reaches a minimum, and rises again. The bottom of the curve sits at one hundred and thirty one pounds, exactly the slope linear regression found in the last section. The difference is that linear regression does not try slopes. It solves for the bottom directly, with a formula, which is why fitting is instant even with many features.",
}
