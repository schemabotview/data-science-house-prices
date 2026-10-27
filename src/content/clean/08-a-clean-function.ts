import type { Section } from '../types'

export const aCleanFunction: Section = {
  id: 'a-clean-function',
  title: "clean(): every rule in one function",
  scene: 'clean-function',
  narration:
    "Fixes spread across a dozen cells are hard to repeat. If next month's export arrives, you would have to rerun them all in the right order and hope. So cell nineteen gathers every rule into one function, clean, which takes the raw table and returns a tidy one. Inside, it parses the dates in both formats, then builds the result as one chain. assign replaces six columns at once: sold, area stripped of spaces, garage filled with zero, price converted to numbers, sqft fixed for the square metre batch, and the bedroom typo corrected. Then drop duplicates, then query keeps only market sales. The side pane draws the chain: raw in at the top, tidy out at the bottom. Cell twenty runs it on a fresh read of the raw file, and then asserts what must be true of the result: price is whole numbers, every sale has a date, there are no duplicates, and no house has more than six bedrooms. An assert does nothing when it holds and stops the notebook with an error when it does not. They are the notebook checking its own work. The answer: fourteen hundred and sixty rows in, fourteen hundred and fifty three out, exactly what the cell-by-cell fixes produced. Cell twenty one saves the result as homes clean dot csv, new in the explorer. From the next course on, every notebook starts from that file, not the raw export.",
}
