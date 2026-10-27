import type { Course } from '../types'
import { targetAndFeatures } from './01-target-and-features'
import { trainTestSplit } from './02-train-test-split'
import { leakage } from './03-leakage'
import { encodingCategories } from './04-encoding-categories'
import { scaling } from './05-scaling'
import { aPipeline } from './06-a-pipeline'

export const features: Course = {
  id: 'features',
  title: "From columns to model inputs",
  sections: [targetAndFeatures, trainTestSplit, leakage, encodingCategories, scaling, aPipeline],
}
