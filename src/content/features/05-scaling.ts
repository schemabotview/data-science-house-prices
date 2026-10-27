import type { Section } from '../types'

export const scaling: Section = {
  id: 'scaling',
  title: "Scaling: fit on train, apply to both",
  scene: 'features-scaling',
  narration:
    "Features arrive on very different scales. Size runs to thousands of square feet, garages from zero to three, and year built sits around nineteen seventy. Many models work better, and their coefficients are easier to compare, when every number is on the same scale. A standard scaler does it. Cell ten fits one on the training rows only, for size and year built, and shows what it learned: a mean size of about fourteen hundred and thirteen square feet with a standard deviation of four hundred and forty seven, and a mean year of nineteen seventy two, with a standard deviation of twenty eight and a half. Scaling then subtracts the mean and divides by the standard deviation, so a value becomes: how many standard deviations from the training average. Cell eleven applies that same scaler to the test rows, and summarises the result. The means are close to zero, but not exactly: zero point zero three for size, minus zero point one one for built. The standard deviations are close to one, but not exactly. And that is correct. The scaler only knows the training rows, so the test rows are measured on the training scale, as a brand new house would be. If you fitted the scaler on all the rows, the test numbers would come out perfect, because test information had leaked into the scaler. Fit on train, apply to both.",
}
