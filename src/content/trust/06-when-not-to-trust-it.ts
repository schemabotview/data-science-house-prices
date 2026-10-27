import type { Section } from '../types'

export const whenNotToTrustIt: Section = {
  id: 'when-not-to-trust-it',
  title: "When not to trust it",
  scene: 'trust-limits',
  narration:
    "Every model has a region where it knows what it is talking about, and that region is the data it was trained on. Cell thirty nine asks about a house far outside it: a castle of twelve thousand square feet, built in sixteen fifty. The largest house the model has ever seen had three thousand eight hundred and thirty three square feet. The linear model carries on with its straight line and values the castle at one million, seven hundred and twenty five thousand pounds. The boosted trees value it at four hundred and sixty eight thousand, because trees cannot predict beyond the prices they have seen, so they simply flatten out. Two good models, two completely different answers, and neither should be believed. The side pane names the two zones. Inside the data, a model's predictions are as good as its validation said, within its interval. Outside it, the model is guessing, and the honest response is to refuse to answer. Cell forty shows the pipeline doing exactly that for one kind of question: an ordinary house in Harbourside, an area that is not in Millbrook's data. The one hot encoder has never seen it, and the prediction fails with a value error, found unknown categories. That is the right behaviour. In the last course, the command and the web service will turn both of these into clear messages instead of numbers.",
}
