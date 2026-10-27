import type { Section } from '../types'

export const anInterval: Section = {
  id: 'an-interval',
  title: "An interval, not a number",
  scene: 'trust-intervals',
  narration:
    "A valuation should come with how sure it is. One way is to train models for quantiles. Cell thirty five trains three boosted models, aimed at the tenth percentile, the median and the ninetieth percentile of price. Cell thirty six asks all three about one test house, fifteen hundred and sixty nine square feet in Hillcrest: two hundred and seventy one thousand, two hundred and ninety two thousand and three hundred and twelve thousand pounds. A ten to ninety percent interval, so it should contain the real price eighty percent of the time. This house actually sold for three hundred and twenty one thousand, outside it. That could be the one in five. So cell thirty seven checks the promise across every test house: the interval contains the price only sixty seven percent of the time. It promises eighty and delivers sixty seven. Its intervals are too narrow, overconfident. Cell thirty eight tries a simpler method. Take the linear model's own errors on the cross validation folds, houses it had not trained on, and use their tenth and ninetieth percentiles as the interval: minus thirty two thousand two hundred to plus thirty three thousand nine hundred pounds around each prediction. On the test set, that interval holds eighty four percent of prices: it keeps its promise, slightly cautiously. Always check whether an interval does what it says. This one is the interval we will ship.",
}
