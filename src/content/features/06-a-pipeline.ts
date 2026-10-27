import type { Section } from '../types'

export const aPipeline: Section = {
  id: 'a-pipeline',
  title: "A pipeline: every step in one object",
  scene: 'features-pipeline',
  narration:
    "Every preparation step so far has to be fitted on the training rows and then applied, in the same way, to any other rows. Doing that by hand, step by step, is exactly where leakage creeps in. scikit learn solves it with pipelines. Cell twelve builds the whole preparation as one object, called prepare. A column transformer sends different columns to different steps. The six number columns go through a small pipeline of their own: first a simple imputer, which fills the missing year built values with the median, the decision the cleaning course deferred until a model needed it. Then the standard scaler. The area column goes to the one hot encoder. Displaying prepare prints the whole structure. Cell thirteen fits it on the training rows and transforms them in one call. The result has eleven hundred and sixty two rows and eleven columns: six scaled numbers, and five area columns, with the names to prove it. The side pane draws the structure. The real value of this object is what comes next. In the modelling course, the model goes on the end of this pipeline. Then a single fit learns every step, imputing, scaling, encoding and modelling, from the training rows alone, and a single predict applies all of them to a new house. No step can peek at the test set, because no step ever sees it during fitting.",
}
