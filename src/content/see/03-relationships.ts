import type { Section } from '../types'

export const relationships: Section = {
  id: 'relationships',
  title: "Relationships: price against size",
  scene: 'see-scatter',
  narration:
    "One variable at a time only goes so far. The interesting questions are about how two variables move together. Cell five draws a scatter plot: every sale is one dot, placed by its size across and its price up. Fourteen hundred and fifty three dots, small and partly transparent, so that dense areas show up darker. The pattern is obvious at a glance: bigger houses cost more, and the dots climb from bottom left to top right. Cell six puts a number on it with the correlation, r, between sqft and price: zero point eight two eight. The side pane gives the scale. Plus one would be every dot on a rising straight line. Zero would mean no straight line link at all. Minus one, a perfect falling line. Zero point eight three is strong. But the picture shows two things the single number cannot. First, the cloud widens to the right. Big houses vary more in price, in pounds, which is the percentage effect from the last section again. Second, look at what is not there: no cluster of houses far below everything else. Before cleaning, the twenty sales recorded in square metres would have sat in a strange group at the far left. The scatter is also a check that the cleaning course did its job.",
}
