import type { Section } from '../types'

export const comparingGroups: Section = {
  id: 'comparing-groups',
  title: "Comparing groups: medians and their spread",
  scene: 'see-groups',
  narration:
    "When we compared areas in the last course we used one number each, the median. A median hides how spread out a group is, so this section draws the spread too. Cell seven computes three quantiles per area: the twenty fifth percentile, the median, and the seventy fifth, sorted by the median and rounded to the nearest thousand. Between the twenty fifth and seventy fifth percentile lies the middle half of each area's sales. Cell eight draws it: a bar for each median, and a black line from the twenty fifth to the seventy fifth percentile, drawn with vlines. The table on the right holds the same numbers. Look at how much the lines overlap. Riverside is clearly the dearest area, and Eastfield the cheapest, yet the middle halves still overlap. The dearer quarter of Eastfield sales starts at about two hundred and sixty six thousand pounds, which is more than the cheaper quarter of Riverside sales, from about two hundred and forty five thousand. Plenty of Eastfield houses cost more than plenty of Riverside houses. That is what the area medians alone hide. Area matters, but it is far from the whole story, and any model that predicted a house's price from its area alone would be wrong by tens of thousands of pounds, for a lot of houses.",
}
