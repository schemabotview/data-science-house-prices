import type { Section } from '../types'

export const booleanMasks: Section = {
  id: 'boolean-masks',
  title: "Boolean masks: keep the rows you ask for",
  scene: 'select-masks',
  narration:
    "Most questions about data start with which rows. Which homes are in Riverside? Cell five asks it in one comparison: homes area, equals equals, Riverside. pandas compares every row at once and gives back a Series of True and False, one per row, called a mask. The side pane lines them up: Hillcrest, false. Old Town, false. Riverside, true. A mask can be counted, because True counts as one: riverside dot sum is two hundred and forty six. And a mask can select: put it inside square brackets and only the True rows are kept. Cell seven combines two masks with an ampersand, which means and: in Riverside, and over two thousand square feet. Each condition sits in its own brackets, because the ampersand binds more tightly than the comparison. The result has twenty six rows and all ten columns. Notice there is no loop anywhere. Every comparison ran over the whole column in one go, which is the NumPy lesson from the last course, at work. But two hundred and forty six is not every sale in Riverside. The comparison is exact, character for character, and some rows spell the area with a space at the end. Those rows are silently left out. A filter that quietly misses rows is one of the most common wrong answers in data work, and we will find these in two sections' time.",
}
