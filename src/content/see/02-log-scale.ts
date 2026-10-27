import type { Section } from '../types'

export const logScale: Section = {
  id: 'log-scale',
  title: "The log scale: prices move in percentages",
  scene: 'see-log',
  narration:
    "There is another way to look at the same prices, and it matters a great deal later. Cell three takes the base ten logarithm of every price and draws its histogram. The long tail has gone. The shape is almost a symmetric bell. Cell four confirms it in numbers: the skew drops from zero point eight two to minus zero point zero five, and the mean and median of the logged prices are almost identical. Why would taking a logarithm do that? The side pane shows the reason. On a log scale, equal ratios become equal distances. Two hundred thousand to two hundred and twenty thousand is a ten percent rise, and so is five hundred thousand to five hundred and fifty thousand. In pounds the second step is two and a half times bigger. In log ten, both steps are exactly the same, zero point zero four one. And prices really do behave in percentages. A good garage might add a few percent to any house, not a fixed number of pounds, and the market rose by a percentage too. Things that combine by multiplying produce a right skewed distribution, and the logarithm turns multiplying back into adding. Keep this in mind for the modelling course. A model fitted on log prices makes errors in percentages, and for houses, that is almost always the error you care about.",
}
