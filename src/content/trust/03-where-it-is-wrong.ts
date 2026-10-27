import type { Section } from '../types'

export const whereItIsWrong: Section = {
  id: 'where-it-is-wrong',
  title: "Where it is wrong",
  scene: 'trust-residuals',
  narration:
    "A single error number hides where the errors are. Cell thirty two computes every test house's residual, the actual price minus the predicted one, and summarises it by area in two ways. The median error asks whether the model is biased, consistently too high or too low. The median miss asks how far off it is, in either direction. The side pane draws the bias as bars. In most areas, the median error is a couple of thousand pounds either way, close to zero, which is what an unbiased model should show. Old Town stands out: its houses sell for about six thousand nine hundred pounds more than the model predicts, consistently. That is not alarming, it is small next to Old Town's typical miss of about fourteen thousand pounds, and with only about fifty test houses per area some wobble is expected. But it is exactly the kind of thing to watch. If Old Town's under prediction grew as new sales arrived, it would mean something about Old Town that the model does not know, perhaps a new railway station, or the old town character itself. The next cell draws all the test errors as a histogram, on the right, centred near zero, roughly symmetric. A model you can trust has errors that look like noise: no pattern by area, by size, or by date.",
}
