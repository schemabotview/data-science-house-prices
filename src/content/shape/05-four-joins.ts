import type { Section } from '../types'

export const fourJoins: Section = {
  id: 'four-joins',
  title: "Four ways to join",
  scene: 'shape-joins',
  narration:
    "Before moving on, it is worth seeing exactly what the different kinds of join would have done with that spelling slip, because the default is the dangerous one. On the left, the two sides: the sales, whose area column still includes Old town with a small t, and the areas table, with its five spellings. In the middle, the four joins, each with its real row count, from one line in the notebook. An inner join keeps only rows whose key is found on both sides: fourteen hundred and thirty three. A left join keeps every row from the left, and fills the areas' columns with N a N where nothing matched: fourteen hundred and fifty three. A right join keeps every row from the right, here every area, so it loses the same twenty sales. And outer keeps everything from both sides. Here it equals the left join, because every area has at least one sale. Now the lesson. pandas' merge is an inner join unless you ask otherwise. Run the obvious line, get no error, no warning, and twenty sales have simply gone, only visible if you happened to compare row counts. So the habits on the right are worth keeping: start with a left join, ask for the indicator, validate the relationship, and compare the row count before and after every join you ever write.",
}
