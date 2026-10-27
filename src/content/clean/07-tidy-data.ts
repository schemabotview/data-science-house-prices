import type { Section } from '../types'

export const tidyData: Section = {
  id: 'tidy-data',
  title: "Tidy data: what clean means",
  scene: 'clean-tidy',
  narration:
    "Before turning this notebook into one reusable function, it is worth naming what we were aiming for, because it has a name: tidy data. Tidy data follows three rules, and this export broke all three. Rule one: each variable is one column, of one type. Price mixed numbers and text, forty five rows like pound one hundred and ninety thousand eight hundred, and sold mixed two date formats. Rule two: each observation, here each sale, is exactly one row. Six sales were entered twice, and one row was not a sale at all, the ten thousand pound transfer. Rule three is the subtle one: each value means one thing. In sqft, twenty values meant square metres. In garage, empty meant zero. In area, Riverside with a trailing space meant Riverside. The ledger on the right lists every fix with the number of rows it touched, and at the bottom, the effect of the whole thing: fourteen hundred and sixty rows in, fourteen hundred and fifty three out. Underneath it is the same sale, before and after: day-first date with slashes in the raw file, ISO date and a zero for the garage in the clean one. None of these fixes was clever. What made them right was that each one was found with a check, explained by the data, and recorded. That is what makes the clean file trustworthy.",
}
