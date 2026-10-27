import type { Section } from '../types'

export const garageTest: Section = {
  id: 'garage-test',
  title: "Does a garage add value? A permutation test",
  scene: 'measure-permutation',
  narration:
    "Correlation said garages barely relate to price. Let us ask the question directly. Cell eleven compares the median price of houses with a garage against those without: houses with a garage sell for thirteen thousand and fifty pounds more. But some gap would appear by luck even if garages meant nothing at all. How do we tell a real gap from a lucky one? The permutation test answers by simulating a world where garages do not matter. The side pane gives the idea. Keep every price exactly where it is, but shuffle which houses are marked as having a garage. In that shuffled world any gap is pure luck. Measure the median gap again. Do that five thousand times, and count how often luck alone produced a gap at least as big as the real one. Cell twelve writes this as a small function, shuffled differences, with a seeded random generator so it replays. The answer is zero point zero zero three six: only thirty six shuffles in ten thousand reach thirteen thousand pounds. Cell thirteen draws all five thousand shuffled gaps, with the real one marked in red, far out in the right tail. So a gap this large would be very unusual if garages did not matter. That fraction has a name: the p value. The next section is about what it does and does not mean.",
}
