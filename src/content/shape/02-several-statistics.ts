import type { Section } from '../types'

export const severalStatistics: Section = {
  id: 'several-statistics',
  title: "Several statistics per group: agg",
  scene: 'shape-agg',
  narration:
    "One statistic per group is rarely enough. Cell three asks for three at once with agg and named aggregations. First it adds a column we could not compute two courses ago: price per square foot, price divided by sqft. It works now, because cleaning turned price into numbers. Then agg takes keyword arguments, and each one is a new column name, equals, a pair: which column to use, and which function to apply. sales is the size of each group's price column, in other words the number of sales. median price is the median of price. median per sqft is the median of the new column. The result is one tidy table, one row per area, with three named columns, rounded. The side pane spells out the pattern, and charts price per square foot by area. Riverside leads again, at two hundred and sixteen pounds per square foot, and Eastfield is lowest, at a hundred and sixty six. That matters, because it rules out a dull explanation. Riverside is not more expensive only because its houses happen to be bigger. Each square foot there costs more. Per square foot is often the fairer comparison between areas, and it is one we will come back to when we build features for a model.",
}
