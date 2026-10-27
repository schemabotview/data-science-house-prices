import type { Section } from '../types'

export const confidenceInterval: Section = {
  id: 'confidence-interval',
  title: "A confidence interval for Riverside",
  scene: 'measure-interval',
  narration:
    "Here is the bootstrap as it really runs in the notebook. Cell seven selects Riverside's prices: two hundred and sixty six sales, median two hundred and ninety three thousand and fifty pounds. Cell eight is the whole bootstrap in one expression: two thousand times, sample the prices with replacement, at the same size, with a fixed random state each time, and keep the median. Then the two point five and ninety seven point five percent quantiles of those medians give the interval. Cell ten does the same with SciPy, which this section adds to the project. pyproject dot toml gains one pinned line, scipy, and the notebook group is installed again. stats dot bootstrap takes the data, the statistic, the number of resamples, the method, and a seed, and it returns the same interval within a few hundred pounds. The side pane draws the bootstrap medians with the two cut-off points marked. So the honest way to report Riverside's typical price is not a single number. It is: about two hundred and ninety three thousand pounds, likely between two hundred and seventy eight and three hundred and one thousand. That interval says how much the answer could move with a different set of sales. It shrinks as the sample grows, and for a small area with twenty sales it would be very wide. A number without its interval looks more certain than it is.",
}
