import type { Section } from '../types'

export const batch: Section = {
  id: 'batch',
  title: "Batch: a file of listings",
  scene: 'ship-batch',
  narration:
    "Agents rarely value one house at a time. A new file arrives in the data folder, listings dot csv: twenty houses for sale in Millbrook, with everything except a price. The command gains a second sub command, batch. The editor shows the function behind it, value file. It reads the listings, and for each house it fills the gaps the way the model expects: an empty garage means none, an unknown build year is left for the model's median. Then it calls exactly the same value function as before. If the house is one the model must refuse, the row gets a note explaining why, instead of a price. The batch never stops halfway, and it never invents a number. Finally it writes everything to a new file. In the terminal: house prices batch, data slash listings dot csv, dash dash out valued dot csv. Twenty houses valued. A quick look at the first few rows with cut and head shows the result, and the side pane draws it: each listing's id, area and size, followed by its price and the low and high ends of its interval. A Riverside house of twelve hundred and thirty nine square feet at about three hundred and three thousand pounds, a large Northgate house at three hundred and seventy nine thousand. That file could go straight into an agent's spreadsheet, or onto a website.",
}
