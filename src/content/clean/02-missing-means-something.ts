import type { Section } from '../types'

export const missingMeansSomething: Section = {
  id: 'missing-means-something',
  title: "Missing means something: a decision per column",
  scene: 'clean-meaning',
  narration:
    "Why would a third of the garages be missing? Cell three counts the values of garage with dropna false, so the gaps are counted too. One garage, five hundred and seventy four houses. Two, three hundred and seventy five. Three, sixty two. And N a N, four hundred and forty nine. Look at what is not in that list: zero. Not one house in the whole export is recorded as having no garage. That is the evidence. The agents left the field empty when there was no garage, so here, empty means zero. Cell four fills those gaps with zero and makes the column whole numbers again, and checks what is still missing: only built, thirteen times. Built gets a different decision, shown in the side pane. These are old houses whose build year nobody knows. We could fill them with the average year, but that would plant thirteen made-up facts in the data, and an old cottage would suddenly look like it was built in the nineteen seventies. So built stays missing, and we will deal with it openly when a model needs a value. That is the rule for every gap: fill it only when the data itself tells you what it means, and otherwise leave it missing, and say so. A filled gap you cannot justify is worse than a gap.",
}
