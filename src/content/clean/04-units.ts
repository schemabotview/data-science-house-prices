import type { Section } from '../types'

export const units: Section = {
  id: 'units',
  title: "Units: a batch measured in square metres",
  scene: 'clean-units',
  narration:
    "Some faults are not visible in any single value. A house of a hundred and forty four square feet looks odd, but not impossible. It only becomes impossible next to its four bedrooms. Cell eight parses the dates, using last course's two formats, and then works out square feet per bedroom. The typical house has about four hundred and eighty five square feet per bedroom. The minimum is thirty. Cell nine lists the houses under two hundred, and they share a pattern: all from Keyline, all in the spring of twenty twenty three. That is not how real houses cluster. It is how a data entry mistake clusters. Keyline recorded those sales in square metres. Cell ten defines the batch the way the agent would describe it, by agent and by dates, rather than by the suspicious numbers. Twenty sales, all twenty of them under two hundred. Then it checks what the batch definition leaves out: one more house under two hundred elsewhere. Remember that one, it is a different fault, and the next section but one finds it. Cell eleven converts the batch to square feet, multiplying by ten point seven six four, and the minimum jumps from thirty to ninety one. Fixing by the batch's description, not by the symptom, matters: a rule like anything under two hundred gets fixed would have quietly altered a house that was wrong for a completely different reason.",
}
