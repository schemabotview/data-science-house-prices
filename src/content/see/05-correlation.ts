import type { Section } from '../types'

export const correlation: Section = {
  id: 'correlation',
  title: "Correlation: every pair at once",
  scene: 'see-corr',
  narration:
    "With several numeric columns, you can ask for every correlation at once. Cell nine takes eight of them, price, size, bedrooms, year built, garage, condition, school rating and distance to the centre, and calls corr. The result is a matrix: every column against every other, with ones down the diagonal, where each column meets itself. It is a lot to read, so cell ten keeps just the column that matters most to us, correlation with price, and sorts it. The side pane draws it as bars. Size leads, at zero point eight three. Bedrooms follow at zero point six seven, but bedrooms and size are themselves correlated at zero point eight, so they largely carry the same information twice. School rating, zero point two eight. Distance to the centre is negative, minus zero point two: further out, cheaper. And then some surprises. Condition, zero point one. Garage, zero point zero nine, almost nothing, even though garages surely add value. And built, zero point one three, as if newer houses cost more. Remember what r measures: a straight line link between two columns, one pair at a time, ignoring everything else. A garage's effect can be hidden by everything else that varies at the same time. And built's link may not be built's at all. The next course takes both of these apart properly.",
}
