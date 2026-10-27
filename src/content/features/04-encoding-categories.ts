import type { Section } from '../types'

export const encodingCategories: Section = {
  id: 'encoding-categories',
  title: "Encoding categories: one-hot",
  scene: 'features-encoding',
  narration:
    "Models do arithmetic, so every feature has to be a number. Size and bedrooms already are. Area is text. Cell eight converts it with a one hot encoder, fitted on the training rows. get feature names out shows what it learned: five new columns, area Eastfield, area Hillcrest, area Northgate, area Old Town and area Riverside. Cell nine applies it to three real rows. An Old Town house gets a one in the Old Town column and zeros everywhere else. A Hillcrest house gets its one in the Hillcrest column. That is all one hot means: one column per category, and a single one, hot, in the right place. Why not simply number the areas, one to five? The side pane shows the problem. Numbers have an order and a size. If Eastfield were one and Riverside five, a model would read Riverside as five times Eastfield, and Hillcrest as somewhere between one and three. None of that means anything for areas. One hot columns carry no order and no distance. Each one only asks: is this house in this area, yes or no? And because the encoder is fitted on the training rows, an area it has never seen would be flagged, rather than silently given a meaning.",
}
