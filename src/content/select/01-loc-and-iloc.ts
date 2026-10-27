import type { Section } from '../types'

export const locAndIloc: Section = {
  id: 'loc-and-iloc',
  title: "Columns and rows: .loc and .iloc",
  scene: 'select-loc',
  narration:
    "A DataFrame answers questions, but first you have to point at the part you mean. This course gets its own notebook, select dot ipynb, and cell one reads the sales again. Cell two picks columns: square brackets with a list of names gives a smaller DataFrame, here area, sqft and beds, and head of three shows its first rows. To reach a single value there are two tools, and the difference between them matters. dot loc works with labels. homes dot loc, two, area, means the row whose label is two, and the column named area: Riverside. dot iloc works with positions, counting from zero. homes dot iloc, two, three, means the third row and the fourth column, and that is also area: Riverside. The side pane lays the two side by side. Each row has a label, the index pandas added, and a position, where it sits right now. At the moment they are the same numbers, zero, one, two, because the rows are still in file order. That is why loc and iloc agree here. It is a coincidence, and the next sections end it. The habit worth building now: when you mean a particular house, use loc and its label. When you mean whatever happens to be in the third row at this moment, use iloc. Most of the time, in this course, you will mean a house.",
}
