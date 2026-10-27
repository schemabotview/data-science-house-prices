import type { Section } from '../types'

export const aBaseline: Section = {
  id: 'a-baseline',
  title: "A baseline: the number to beat",
  scene: 'model-baseline',
  narration:
    "Before building a real model, build a terrible one on purpose. A baseline tells you what knowing nothing scores, so that every later model can be judged against it. Cell fourteen makes the simplest guess possible: for every house in the test set, predict the median price of the training set, the same number every time, whatever the house. Then it scores the guess with the mean absolute error, which the side pane spells out. For each test house, take the difference between the actual price and the predicted one, ignore whether it is above or below, and average those differences. The result is in pounds, which makes it easy to understand: on average, the guess is off by this much. For the baseline it is fifty nine thousand five hundred and eighty one pounds. That is the number to beat. A model that cannot do better than fifty nine and a half thousand pounds of typical error has learned nothing about houses at all, however clever it looks. It sounds too obvious to bother with. In practice, a surprising number of impressive looking models, published or deployed, turn out to barely beat a baseline like this one, because nobody computed it. So always compute it first. It takes one line, and it keeps every later number honest.",
}
