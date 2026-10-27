import type { Section } from '../types'

export const theBootstrap: Section = {
  id: 'the-bootstrap',
  title: "The bootstrap: how sure, from one sample",
  scene: 'measure-bootstrap',
  narration:
    "The bootstrap is one of the most useful ideas in statistics, and it fits on one screen. The question: Riverside has two hundred and sixty six sales, with a median of two hundred and ninety three thousand and fifty pounds. How sure can we be of that number, with no other sample to compare it with? Step one, start from the one sample we have. Step two, draw two hundred and sixty six sales from it, with replacement: each draw can pick any sale, including one already picked. So the new sample has some sales twice and some not at all, and its median comes out a little different. That new sample is a plausible alternative version of Riverside's sales. Step three, repeat that two thousand times, keeping each median. Their histogram, on the right, is the bootstrap's estimate of the sampling distribution from the last section, made from one sample alone. Step four, keep the middle ninety five percent: cut off the lowest two and a half percent and the highest two and a half percent. What remains is a ninety five percent confidence interval: from two hundred and seventy eight thousand one hundred to three hundred and one thousand four hundred pounds. The table checks the hand made version against SciPy's bootstrap function, with its own seed. They agree to within a few hundred pounds, which is exactly as close as two different sets of random draws should.",
}
