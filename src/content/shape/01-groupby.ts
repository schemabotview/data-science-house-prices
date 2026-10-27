import type { Section } from '../types'

export const groupby: Section = {
  id: 'groupby',
  title: "groupby: which area costs most",
  scene: 'shape-groupby',
  narration:
    "With clean data, the questions can finally be about houses. This course works in shape dot ipynb, and cell one reads the clean file from the last course, asking pandas to parse sold as dates: one thousand four hundred and fifty three sales. Which area costs most? Cell two answers in one line: homes, group by area, the price column, median, sorted. The side pane shows what that line does, in three steps with a famous name: split, apply, combine. Split divides the rows into one group per area. Apply runs the median on each group's prices separately. Combine collects the answers into one Series, labelled by area. Eastfield is cheapest, at about two hundred and twenty eight thousand pounds. Riverside is the most expensive, at about two hundred and ninety three thousand. The code underneath is the same split, apply, combine written as a loop and a dictionary. groupby does it in one call, and fast, because each group is still a NumPy array underneath. But count the groups. There are six, not five. Old town, with the small t, is still its own area, with its own median. groupby takes the spelling exactly as written, just as the double equals did in the select course. Hold on to that. In three sections it becomes a real problem.",
}
