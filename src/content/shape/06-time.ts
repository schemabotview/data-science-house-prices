import type { Section } from '../types'

export const time: Section = {
  id: 'time',
  title: "Time: the trend through the noise",
  scene: 'shape-time',
  narration:
    "Prices are not fixed in time, and a model that ignores when a house sold will blame the house for the market. Because sold is a real datetime column, pandas can group by time. Cell ten sets sold as the index, and resample quarterly, Q S for quarter start, takes the median price in each quarter. Resample is groupby for time: it makes the time buckets for you, even quarters with no sales. Quarterly medians jump about, because each quarter holds only about sixty sales, and which houses happen to sell matters. So the same cell adds a rolling mean over four quarters. Each value is the average of the last four, which smooths the noise and shows the direction. The first three are N a N, because there are not yet four quarters to average. The plot shows both. The blue line jitters, the orange one climbs steadily. Cell eleven measures that climb, from the first rolling value to the last: up twenty three point eight percent across the period. That is a real feature of this market, and an important one. A house sold in twenty twenty one and an identical one sold in twenty twenty six did not sell for the same price. When we come to build a model, the date of sale has to be one of its inputs.",
}
