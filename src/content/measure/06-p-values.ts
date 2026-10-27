import type { Section } from '../types'

export const pValues: Section = {
  id: 'p-values',
  title: "p-values, plainly",
  scene: 'measure-p-values',
  narration:
    "A p value of zero point zero zero three six is easy to misread, so this section takes it apart. First, what it says: if garages made no difference, a gap this big would turn up by luck in fewer than four tries in a thousand. So the gap is very probably real. What it does not say is how big the effect is. Cell fourteen measures that directly: the gap is five point two percent of the median price. Whether five percent matters depends on you, not on the p value. Nor does it say what causes the gap. Houses with garages might also be bigger, or in better areas. Now the second cell, which is the important one. It asks exactly the same question of a random forty sales. The gap is still there, eighteen thousand pounds, but the p value is zero point five. Half of all shuffles do as well. With forty sales, there is no evidence at all. And this is where people go wrong: no evidence of an effect is not evidence of no effect. The garage effect in Millbrook did not change. The data was simply too small to see it. The table puts the two side by side: same question, same kind of gap, opposite conclusions, and the only difference is the amount of data. Always report the size of an effect and its interval, and treat a p value as one piece of evidence, never as the answer.",
}
