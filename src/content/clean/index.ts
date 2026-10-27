import type { Course } from '../types'
import { missingValues } from './01-missing-values'
import { missingMeansSomething } from './02-missing-means-something'
import { wrongTypes } from './03-wrong-types'
import { units } from './04-units'
import { duplicates } from './05-duplicates'
import { outliers } from './06-outliers'
import { tidyData } from './07-tidy-data'
import { aCleanFunction } from './08-a-clean-function'

export const clean: Course = {
  id: 'clean',
  title: "Make the data trustworthy",
  sections: [missingValues, missingMeansSomething, wrongTypes, units, duplicates, outliers, tidyData, aCleanFunction],
}
