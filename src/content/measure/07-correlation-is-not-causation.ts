import type { Section } from '../types'

export const correlationIsNotCausation: Section = {
  id: 'correlation-is-not-causation',
  title: "Correlation is not causation",
  scene: 'measure-confounder',
  narration:
    "Two courses ago, correlation suggested that newer houses cost more: built and price correlated at zero point one three. Cell sixteen repeats it. Is it true that a newer house is worth more, all else equal? Cell seventeen looks at where the new houses are. The median year built differs hugely between areas: Old Town's houses date from the nineteen thirties, Riverside's from the two thousands. And Riverside, from earlier courses, is the dearest area. So there is another explanation. Area could be driving both: dear areas happen to have newer houses, and dear areas have higher prices. The side pane draws that: area points at built, and area points at price, with no arrow between built and price at all. A variable like area, which drives both of the things you are comparing, is called a confounder. Cell eighteen tests it by holding area fixed. Inside each area separately, the correlation between built and price is close to zero: point zero six, minus point zero nine, point zero five. Within an area, a newer house is not worth more. The overall zero point one three was the area talking all along. The general lesson: a correlation between two columns can be produced by a third. Before believing that one thing affects another, ask what else differs between the houses, and compare like with like. In the modelling course, putting area into the model alongside built does exactly that.",
}
