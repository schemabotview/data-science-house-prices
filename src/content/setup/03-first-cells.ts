import type { Section } from '../types'

export const firstCells: Section = {
  id: 'first-cells',
  title: 'read_csv: the sales, as a DataFrame',
  scene: 'setup-first-cells',
  narration:
    "Here is the notebook, explore dot ipynb, with its first two cells. Cell one imports pandas under its usual short name, pd, then reads the sales with pd dot read csv. The path starts with dot dot, because a notebook runs from its own folder, notebooks, and the data sits one level up. The result is a DataFrame, which we name homes. The cell's last line is homes dot shape, and because it is the last line, the notebook prints its value under the cell: one thousand four hundred and sixty rows, ten columns. Cell two asks for homes dot head: the first five rows. The side pane shows what read csv did. At the top are the first lines of the file itself, plain text, values separated by commas. The first line is the header. Every other line became one row of the DataFrame, and the header became the column names: id, sold, agent, area, and on to price. Then pandas added something the file never had, the index, the bold zero, one, two down the left. It labels each row, and it is how pandas finds rows later. Now look harder at those five rows, because they already tell us about this data. Row one's sold date is written day first, with slashes, while the others are year first. Garage says N a N in two rows: Not a Number, pandas' mark for a missing value. And built is shown as nineteen sixty one point zero, a decimal, for a year. None of that is a mistake by pandas. It is the data, reporting itself honestly. The next section looks at how pandas stores it.",
}
