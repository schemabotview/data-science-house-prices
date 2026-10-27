import type { Section } from '../types'

export const wrongTypes: Section = {
  id: 'wrong-types',
  title: "Wrong types: price, from text to numbers",
  scene: 'clean-types',
  narration:
    "Now the problem we have known about since the first info: price is text. Before fixing it, find out exactly which values are the trouble. Cell five uses pd dot to numeric with errors equals coerce. Every price that is a plain number converts, and anything else becomes N a N, so the N a Ns point straight at the problem rows. Selecting them shows the pattern: pound sign, a comma for thousands, and every one of them from the same agent, Bloom. Cell six counts them: forty five. Forty five rows out of fourteen hundred and sixty turned a whole column into text. Now that the pattern is known, the fix is exact rather than hopeful. Cell seven removes the pound sign, removes the commas, and converts. The side pane follows one real price through it: pound one hundred and ninety thousand eight hundred, then without the pound sign, then without the comma, and finally a number. This time to numeric is called without errors equals coerce, and that matters. If any value still could not be converted, the cell would fail loudly, instead of quietly turning it into a gap. The result is int sixty four, and the question we could not ask until now finally has an answer: the median price in Millbrook is two hundred and fifty one thousand, four hundred pounds.",
}
