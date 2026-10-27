import type { Section } from '../types'

export const aDecisionTree: Section = {
  id: 'a-decision-tree',
  title: "A decision tree: questions in order",
  scene: 'model-tree',
  narration:
    "A completely different kind of model works by asking questions. Cell twenty three fits a decision tree, limited to three levels of questions. Its test error is thirty four thousand and eighty seven pounds, worse than the straight line on size alone. Cell twenty four prints the tree, and it is worth reading. The first question is about size: is it fifteen hundred and four square feet or less? The tree chose that question because, of all possible splits, it divides the prices most cleanly. Each side then asks about size again, at eleven hundred and twenty seven or two thousand and eighty four square feet. Then, mostly: is it in Riverside? So without being told anything, the tree found the two biggest effects in the data, size and Riverside, in the right order. Every house ends up in one of eight leaves, and each leaf predicts one price, the average of the training houses that landed there: from about a hundred and eighty nine thousand pounds to four hundred and eighty one thousand. That is the tree's weakness at this depth. It can only ever predict eight different prices, so a house at the edge of a box is valued like the middle of it. Trees shine where a line cannot follow the data, with thresholds and interactions. And their real power appears when many of them work together.",
}
