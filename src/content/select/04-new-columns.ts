import type { Section } from '../types'

export const newColumns: Section = {
  id: 'new-columns',
  title: "New columns, and the first wall: price is text",
  scene: 'select-new-columns',
  narration:
    "New columns come from arithmetic on old ones, a whole column at a time. Cell ten works out each house's age: twenty twenty six minus built. One line, no loop, and the new column is simply assigned into homes under the name age. The tail of the result shows built and age side by side: built in nineteen fifty six, seventy years old. Built in two thousand and seven, nineteen. Notice the ages are decimals, seventy point zero, because built is a float column, and any year that is missing gives a missing age. A missing value in, a missing value out. pandas never invents an answer. So the next question is the obvious one: price per square foot, price divided by sqft. Cell eleven tries it, and it fails, with a type error: unsupported operand types for division, str and int. The side pane shows why. sqft is int sixty four, numbers. But price is str, text, the problem we found in the very first info. You cannot divide text by a number, and pandas refuses rather than guessing. This is the right behaviour. A tool that quietly turned pound two hundred and fifteen thousand into a number, or into nothing, would hand you a wrong average with no warning. So price per square foot waits. The cleaning course turns price into real numbers, and then this cell works.",
}
