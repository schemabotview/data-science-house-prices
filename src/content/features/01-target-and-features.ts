import type { Section } from '../types'

export const targetAndFeatures: Section = {
  id: 'target-and-features',
  title: "Target and features: X and y",
  scene: 'features-target',
  narration:
    "Time to answer the question the whole course is about: what is this house worth? Answering it with a model starts by deciding exactly what the model sees. This notebook, model dot ipynb, will carry us through three courses, and this section adds scikit learn, the standard Python library for machine learning, pinned like everything else in pyproject dot toml. Cell one reads the clean sales and adds one column. A model cannot use a date directly, so months counts the months since January twenty twenty one: zero for a sale that month, sixty eight for September twenty twenty six. That lets the model learn the rising market we measured in the shape course. Cell two makes the split every machine learning problem starts with. y is the target, the column to predict: price. X holds the features, the columns the model may use: size, bedrooms, year built, garages, condition, area and months. Seven features, fourteen hundred and fifty three rows. Cell three shows the first rows of X. The side pane also lists what was left out, on purpose. id is a label, not a property of a house. agent says who sold it, not what it is. And price is not a feature, because it is the answer. That last one sounds obvious. In the leakage section we will see how easily the answer can sneak in anyway.",
}
