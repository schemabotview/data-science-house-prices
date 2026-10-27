import type { Section } from '../types'

export const duplicates: Section = {
  id: 'duplicates',
  title: "Duplicates: one sale, entered twice",
  scene: 'clean-duplicates',
  narration:
    "A duplicate row is one sale counted twice, and it quietly inflates every count and tilts every average towards the houses that happen to be repeated. Cell twelve asks pandas: homes dot duplicated dot sum. duplicated marks a row True when an identical row has already appeared above it, so the sum counts the second copies: six. Cell thirteen shows them in pairs, using keep equals False, which marks both copies so you can see them side by side. Same id, same date, same area, same price, every column equal. Not two houses that happen to sell for the same price on the same day, which would be possible, but one sale with one id, entered twice. That shared id is what makes this safe to call a duplicate. Cell fourteen removes them with drop duplicates, which keeps the first copy of each, and the shape drops from fourteen hundred and sixty rows to fourteen hundred and fifty four. Notice that duplicated compares whole rows. Two rows with the same id but a different price would not be caught by this, and in real data you would then have to decide which record is right. Here, every duplicate is an exact copy, so the decision is simple, and we have it in writing.",
}
