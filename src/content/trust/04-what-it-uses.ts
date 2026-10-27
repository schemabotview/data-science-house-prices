import type { Section } from '../types'

export const whatItUses: Section = {
  id: 'what-it-uses',
  title: "What it uses: permutation importance",
  scene: 'trust-importance',
  narration:
    "Which features does the model actually rely on? Coefficients can mislead, because they depend on the units of each feature. Permutation importance asks the question directly, and it works for any model. The idea is in the side pane. Take the test set, and shuffle one column, say size, so that each house gets some other house's size. The link between that column and price is now broken. Score the model again, and see how much worse it gets. A column the model relies on costs a lot when it is shuffled. A column it ignores costs nothing. Cell thirty four does this for every column, twenty times each with a seed, and averages. Shuffling size adds fifty six thousand pounds to the error. Size is everything, as every course has hinted. Area adds twelve thousand, and months, the rising market, nine thousand four hundred. Garage, two thousand eight hundred, and condition about a thousand. And bedrooms and year built add nothing at all, within a few pounds of zero. That is the same conclusion as the coefficients and the hidden rule two sections ago, reached a completely independent way. When two different methods agree about what a model uses, you can explain it to someone with some confidence.",
}
