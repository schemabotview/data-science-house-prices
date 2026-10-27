import type { Section } from '../types'

export const trainTestSplit: Section = {
  id: 'train-test-split',
  title: "Train and test: the honest exam",
  scene: 'features-split',
  narration:
    "A model that is scored on the same houses it learned from will always look better than it really is. It can partly memorise them. So before any model exists, we set some houses aside. Cell four uses train test split. It shuffles the rows, with random state fixed so the shuffle replays, and puts twenty percent aside as a test set. One thousand one hundred and sixty two sales to train on, two hundred and ninety one to test with. The side pane shows the plan. The model learns only from the training rows. The test rows stay locked away until the very end, when they act as houses the model has never seen, like the next one that comes onto the market. Cell five checks that the split is fair: the median price is about two hundred and fifty three thousand pounds in the training set, and two hundred and forty seven thousand in the test set. Close, as it should be with a random shuffle, and not identical, also as it should be. One honest note. A random split mixes old and new sales together. If the real job were forecasting next year's prices, we would split by time instead, training on the past and testing on the future. Here the job is valuing a house today, given recent sales, so a random split is a fair exam.",
}
