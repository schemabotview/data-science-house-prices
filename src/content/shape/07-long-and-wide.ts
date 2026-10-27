import type { Section } from '../types'

export const longAndWide: Section = {
  id: 'long-and-wide',
  title: "Long and wide: one table, two shapes",
  scene: 'shape-long-wide',
  narration:
    "The last tool in this course is about shape itself. Cell twelve builds a pivot of median price by year and area: six years down, five areas across. That is wide data, one column per area. It reads beautifully as a table, and you can compare areas along each row. But a column per area is awkward to compute with. Add a sixth area and the table grows a column. Ask for the median across all areas and years, and you have to pull numbers from five columns at once. Cell thirteen converts it with melt. The year becomes a column called sold, each area name moves into a column called area, and each price into a column called median. Cell fourteen compares shapes: six rows by five columns wide, and thirty rows by three columns long. Exactly the same thirty numbers, arranged two ways. The side pane shows both, with the first few rows of each. Long data is what pandas, plotting libraries and models want: one observation per row, every variable a column. That is just the tidy rule from the cleaning course again. Wide is how people like to read. So keep your data long while you work, and pivot it wide at the very end, when a human needs to read it. melt takes you from wide to long, and pivot takes you back.",
}
