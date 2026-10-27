import type { Section } from '../types'

export const sorting: Section = {
  id: 'sorting',
  title: "Sorting: labels travel with their rows",
  scene: 'select-sorting',
  narration:
    "Which are the biggest houses in Millbrook? Cell eight answers with nlargest: the five largest by sqft, keeping area, sqft and beds. The largest is in Riverside, three thousand eight hundred and thirty three square feet, and the list ends with a house from Old Town. Look at the labels down the left of that result: eleven eighty eight, six fifty, six ninety one, one seventy five, and one. Sorting moved the rows, and each row took its label with it. Now loc and iloc stop agreeing, and cell nine shows it. top dot loc, one, area, asks for the row labelled one: that is the old row one, the Old Town house, now sitting at the bottom of the list. top dot iloc one asks for whatever is second from the top right now: a house in Northgate. Same number, two different houses. The side pane marks both rows, with each row's current position next to its label. This is exactly why the index exists. After any amount of sorting and filtering, label one still means the same sale it meant when the file was read, so you can always find your way back to it. Use loc when you mean that house. Use iloc only when you mean a place in the current order, like the top row of a ranking.",
}
