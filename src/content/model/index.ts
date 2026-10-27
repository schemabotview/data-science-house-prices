import type { Course } from '../types'
import { aBaseline } from './01-a-baseline'
import { aStraightLine } from './02-a-straight-line'
import { leastSquares } from './03-least-squares'
import { manyFeatures } from './04-many-features'
import { aLogTarget } from './05-a-log-target'
import { aDecisionTree } from './06-a-decision-tree'
import { gradientBoosting } from './07-gradient-boosting'
import { overfitting } from './08-overfitting'

export const model: Course = {
  id: 'model',
  title: "Predict prices",
  sections: [aBaseline, aStraightLine, leastSquares, manyFeatures, aLogTarget, aDecisionTree, gradientBoosting, overfitting],
}
