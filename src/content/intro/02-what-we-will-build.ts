import type { Section } from '../types'

export const whatWeWillBuild: Section = {
  id: 'what-we-will-build',
  title: "What we'll build",
  scene: 'intro-what-we-build',
  narration:
    "Here is where we are going, before we take a single step. On the left is where it starts: data slash homes dot csv, fourteen hundred and sixty house sales from the town of Millbrook, over almost six years. It looks tidy in the first few lines. It is not. Somewhere in it are prices typed as text with pound signs, dates in two different formats, a batch of sizes in square metres, sales entered twice, and a few other surprises, every one of which we will find, explain and fix. In the middle is what we build along the way: seven notebooks where we explore, clean, measure and model, and then a proper Python package, house prices, with tests. On the right is where it ends. A command: ask it about a seventeen hundred and ten square foot house in Riverside, built in two thousand and four, with two garages, and it answers three hundred and eighty three thousand pounds, likely between three hundred and fifty and four hundred and seventeen thousand. Ask it about an area it has never seen, and it refuses, and says why. And a web service that answers the same questions, for any app or website. Its typical error on houses it has never seen is under twenty thousand pounds, and by the end you will know exactly what that means, and how far to trust it. Let's begin.",
}
