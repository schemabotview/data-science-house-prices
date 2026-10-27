import type { Section } from '../types'

export const missingValues: Section = {
  id: 'missing-values',
  title: "Missing values: count the gaps",
  scene: 'clean-missing',
  narration:
    "Every finding later in this course depends on the rows being right, so this course goes through the data fault by fault, in a new notebook, clean dot ipynb. The first question for any dataset is what is missing. Cell one reads the raw sales and calls homes dot isna dot sum. isna gives True wherever a value is missing, and sum counts the Trues, column by column. Eight columns are complete. Two are not: built is missing thirteen times, and garage four hundred and forty nine times. Cell two swaps sum for mean, which turns the counts into shares: under one percent of build years, but almost thirty one percent of garages. Nearly a third of a column is empty. The side pane shows where a gap comes from. In the file it is simply nothing between two commas, and read csv turns nothing into N a N. N a N is a floating point value, which is why both of these whole number columns came out as floats in the first course. So now we know how much is missing. The harder question, and the next section, is what each gap actually means, because the right fix depends entirely on that, and getting it wrong quietly changes every average that follows.",
}
