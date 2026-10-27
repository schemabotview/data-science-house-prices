import type { Section } from '../types'

export const pivotTables: Section = {
  id: 'pivot-tables',
  title: "Pivot tables: area by bedrooms",
  scene: 'shape-pivot',
  narration:
    "groupby with one key gives a list. Group by two keys, and the natural shape is a grid. Cell four builds one with pivot table: areas down the side, bedroom counts across the top, and in each cell the median price of the sales that fall in it. The side pane names the four arguments. index decides the rows. columns decides the columns. values is what fills the cells, and aggfunc says how each cell sums up its sales, here the median. round minus three rounds to the nearest thousand pounds, so the grid is readable. Read along a row and prices climb with bedrooms, as you would expect. Read down a column and the areas order themselves much as they did by median. The plot picks two rows: Riverside and Eastfield. With one bedroom, Riverside is about seventy thousand pounds dearer. The gap holds at every size up to five bedrooms. The six bedroom column is left off the plot on purpose: a six bedroom house is rare, so each of those cells stands on only a handful of sales, and a median of a handful is fragile. A pivot table shows you a number in every cell whether it stands on two sales or two hundred, so always ask how many. That question, how sure we can be, gets a whole course of its own.",
}
