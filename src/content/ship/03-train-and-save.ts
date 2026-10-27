import type { Section } from '../types'

export const trainAndSave: Section = {
  id: 'train-and-save',
  title: "Train and save",
  scene: 'ship-train',
  narration:
    "Next, the model. Two new modules hold what the modelling courses decided. features dot py names the seven features, computes months since January twenty twenty one, and builds the same column transformer as the notebook. train dot py, in the editor, does what the last three courses did, end to end, with no notebook in sight. It loads and cleans the raw export, makes the features, splits with the same seed, and fits the linear pipeline. Then it computes the interval offsets from cross validated errors, exactly as the trust course decided, and gathers the facts the model will need later into a small dictionary: its test error, the interval, the areas it knows, the range of sizes it learned from, and the latest month. joblib dot dump saves the fitted pipeline to models slash model dot joblib, and the facts go to model dot json beside it. The models folder is listed in dot gitignore, because a trained model is something to rebuild, not something to commit. In the terminal, python dash m house prices dot train runs it: eleven hundred and sixty two training sales, two hundred and ninety one test sales, and a test error of nineteen thousand nine hundred and twenty five pounds. The table on the right puts that beside the notebook's final score. Identical, to the pound. The package is the notebook, made repeatable.",
}
