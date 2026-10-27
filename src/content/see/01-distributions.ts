import type { Section } from '../types'

export const distributions: Section = {
  id: 'distributions',
  title: "Distributions: the shape of prices",
  scene: 'see-distributions',
  narration:
    "Numbers in a table tell you a lot. A picture tells you what to ask next. This course's notebook, see dot ipynb, starts by reading the clean sales, fixing the area spelling and joining the area facts, the last course in three lines. Then one question: what do prices look like as a whole? The first cell gives three numbers. The mean is about two hundred and sixty two thousand five hundred pounds, the median two hundred and fifty one thousand four hundred, and a third number, skew, is zero point eight two. Cell two draws the histogram: prices cut into bins twenty five thousand pounds wide, each bar the number of sales in its bin. The notebook draws the figure matplotlib made, from exactly the numbers it plotted. The shape explains the three numbers. Most sales pile up in the middle, near the median, and then a long tail stretches out to the right: a few expensive houses, far from the rest. Those few pull the mean towards them, which is why it sits eleven thousand pounds above the median. That is what a positive skew means: a longer tail on the right. For prices, incomes and anything else with a long right tail, the median is the better summary of a typical value. It is the price of the house in the middle, and a single mansion cannot move it.",
}
