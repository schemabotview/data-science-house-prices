import type { Section } from '../types'

export const aLogTarget: Section = {
  id: 'a-log-target',
  title: "A log target: tried, measured, dropped",
  scene: 'model-log',
  narration:
    "In the visualisation course, prices looked symmetric on a log scale, and I suggested a model on log prices might do better, because it makes errors in percentages. That was a hypothesis. This section tests it. Cell twenty one wraps the same pipeline in a transformed target regressor: it fits on the log of price, and converts its predictions back with exp. To compare the two fairly in percentage terms, typical miss measures each house's error as a share of its price, and takes the median. The linear model on price misses by six point two percent. The log model, by seven percent. Worse. Cell twenty two splits the test houses into thirds by price and compares the median error in each. The log model wins only on the cheapest third, by a few hundred pounds, and loses on the rest. So we drop it. And there is a reason, which the reveal from the last section explains. These prices were built by adding pounds: so much per square foot, plus so much per garage, plus the area premium. A straight line in pounds is exactly the right shape for that. Real markets are often more multiplicative, and then the log target would win. The lesson is the loop in the side pane. An idea, however sensible, is a hypothesis. Measure it on the test set, then keep it or drop it, and say which.",
}
