import type { Section } from '../types'

export const samples: Section = {
  id: 'samples',
  title: "Samples: every answer is a little off",
  scene: 'measure-samples',
  narration:
    "We have fourteen hundred and fifty three sales, but they are only the sales that happened. Any dataset is a sample of a bigger world, and a sample gives an answer that is a little off. How far off? This section finds out by experiment, using the data itself as the whole world. Cell four draws one random sample of a hundred sales. random state equals one fixes the draw, so it replays exactly. Its median is two hundred and thirty nine thousand, four hundred and fifty pounds, about twelve thousand pounds below the median of every sale. Is that bad luck, or normal? Cell five draws a thousand different samples of a hundred, each with its own random state, and keeps each one's median. describe summarises those thousand medians. They centre on the true median, two hundred and fifty one thousand four hundred. But they spread out, with a standard deviation of about seven thousand eight hundred pounds, from about two hundred and thirty one thousand at the lowest to two hundred and eighty four thousand at the highest. Cell six draws their histogram. That bell is called a sampling distribution: every answer one sample of a hundred could have given you. Our first sample, twelve thousand pounds off, was a bit unlucky but entirely normal. The catch is that in real life you only ever get one sample. The next section shows how to estimate that spread from the one sample you have.",
}
