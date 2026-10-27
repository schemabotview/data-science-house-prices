import type { Section } from '../types'

export const dataframeAnatomy: Section = {
  id: 'dataframe-anatomy',
  title: 'Anatomy of a DataFrame: an index and Series',
  scene: 'setup-dataframe',
  narration:
    "Cell three calls homes dot info, the first thing to run on any new data. It prints the DataFrame's structure: a range index from zero to one thousand four hundred and fifty nine, then one line per column, with how many values are present and the column's d type, its data type. The side pane draws what that means. A DataFrame is one index, shared by every row, plus a set of columns, and each column is its own object, a Series. A Series holds one data type, for every value in it. sqft is int sixty four, whole numbers. area is str, text. built and garage are float sixty four, and info explains why: garage has only one thousand and eleven values out of fourteen sixty. The rest are missing, and a missing value is stored as N a N, which is a float, so the whole column becomes floats. That is why a year printed as nineteen sixty one point zero. Now the surprise, highlighted in red. price is str: text, not a number. Cell four confirms it. Selecting one column with square brackets gives a Series, and its d type is a string type. Why? One estate agent typed some prices with a pound sign and commas, like pound two hundred and fifteen thousand. pandas reads a column one way only, and a column that holds even one value that is not a number must be text. So at the moment, we cannot even average a price. That is fine. The cleaning course fixes it properly, and finding it now, in the first minute, is exactly what info is for.",
}
