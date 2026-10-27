import type { Section } from '../types'

export const centreAndSpread: Section = {
  id: 'centre-and-spread',
  title: "Centre and spread: why prices use the median",
  scene: 'measure-centre',
  narration:
    "Everything so far has described the sales we have. This course asks how far those descriptions can be trusted, in a new notebook, stats dot ipynb. It starts with the two kinds of summary every dataset needs: where the middle is, and how spread out the values are. Cell one gives the mean, the median and the standard deviation of price: about two hundred and sixty two thousand, two hundred and fifty one thousand, and seventy three thousand pounds. Cell two gives another measure of spread, the interquartile range, the width of the middle half: about ninety one thousand pounds. Then cell three runs an experiment. It adds one imaginary sale, a five million pound mansion, to the fourteen hundred and fifty three real ones, and summarises again. The side pane shows the damage. One sale out of fourteen hundred and fifty four moves the mean by more than three thousand pounds, and nearly doubles the standard deviation. The median moves by fifty pounds. Statisticians call the median and the interquartile range robust: they describe the typical sale, and a single extreme value cannot drag them around. Real house price data always has a few extraordinary sales, so for prices, quote the median and the interquartile range. Use the mean and standard deviation when you know the values are well behaved, and when a model needs them.",
}
