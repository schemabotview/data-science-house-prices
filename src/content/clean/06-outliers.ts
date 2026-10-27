import type { Section } from '../types'

export const outliers: Section = {
  id: 'outliers',
  title: "Outliers: a question, not an error",
  scene: 'clean-outliers',
  narration:
    "describe gives the shape of a column in eight numbers, and cell fifteen asks for beds and price. Two numbers stand out. Somebody has twelve bedrooms, and somebody paid ten thousand pounds for a house. A common way to flag unusual values is the interquartile range. Take the middle half of the prices, from the twenty fifth percentile to the seventy fifth. Then put a fence one and a half times that width beyond each end. Cell sixteen computes the fences: about seventy six thousand pounds below, about four hundred and thirty nine thousand above. One price falls below the low fence. Thirty six fall above the high one. Here is the part that matters: a fence finds rows to look at. It does not find errors. Cell seventeen looks. The twelve bedroom house has one thousand and ninety six square feet, which is the house we met two sections ago, and a two with a stray one in front. The ten thousand pound sale is a family transfer, not a market sale, so it does not belong in data about market prices. And the thirty six expensive houses? They are simply big houses in good areas, which is exactly what we want a model to learn about. Cell eighteen makes exactly two changes: fix the typo with loc, and drop the transfer. Fourteen hundred and fifty three sales remain.",
}
