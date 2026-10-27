import type { Section } from '../types'

export const textAndCategories: Section = {
  id: 'text-and-categories',
  title: "Text: one area, three spellings",
  scene: 'select-text',
  narration:
    "Two sections ago a filter missed some Riverside sales. Cell twelve shows why. value counts lists every distinct value of area with how many times it appears, and there are seven, not five. Riverside appears twice: two hundred and forty six times as written, and twenty times with a space at the end. You cannot see that space in the output, which is exactly what makes it dangerous. And Old Town appears twice too, once with a small t. Cell thirteen fixes the spaces. The dot str accessor applies a string method to every value in a column, and strip removes spaces from both ends. Written back into homes, Riverside becomes one value with two hundred and sixty six sales, the side pane shows them merged. Old town with a small t is still there. It is a different slip, a matter of case, not spaces, and I am leaving it on purpose: in the course on joins it will make a real join fail, which is a far better way to learn to check for it. The last cell is about memory. A column of text stores a full string for every row. Converting it to the category type stores each distinct area once, plus a small code per row. The plot compares them: about eighty four thousand bytes as text, under two thousand as a category. Five areas repeated fourteen hundred times is exactly the shape category is made for.",
}
