import type { Section } from '../types'

export const aCommand: Section = {
  id: 'a-command',
  title: "A command: value a house",
  scene: 'ship-command',
  narration:
    "Now the question the whole course has been asking finally gets a tool. Two more modules. value dot py loads the saved model and its facts, and holds the one function that matters: value, which takes a house, checks that it is inside the data the model knows, and returns a price with its interval, rounded to the nearest thousand. cli dot py, in the editor, wraps it in a command with argparse, and one line in pyproject, project dot scripts, turns house prices into a real command on the path. The terminal asks four questions. A seventeen hundred and ten square foot Riverside house, built in two thousand and four, with two garages: three hundred and eighty three thousand pounds, likely between three hundred and fifty and four hundred and seventeen thousand. The identical house in Eastfield: three hundred and thirteen thousand. Seventy thousand pounds less, just as the area coefficient said. Then the two questions from the trust course. A house in Harbourside: no valuation, because there are no sales in Harbourside, and the message lists the areas it does know. And the twelve thousand square foot castle: no valuation, because it learned from five hundred and twenty five to three thousand eight hundred and thirty three square feet. A clear refusal, with the reason, instead of a confident number that means nothing.",
}
