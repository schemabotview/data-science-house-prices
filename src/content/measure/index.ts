import type { Course } from '../types'
import { centreAndSpread } from './01-centre-and-spread'
import { samples } from './02-samples'
import { theBootstrap } from './03-the-bootstrap'
import { confidenceInterval } from './04-confidence-interval'
import { garageTest } from './05-garage-test'
import { pValues } from './06-p-values'
import { correlationIsNotCausation } from './07-correlation-is-not-causation'

export const measure: Course = {
  id: 'measure',
  title: "How sure are we?",
  sections: [centreAndSpread, samples, theBootstrap, confidenceInterval, garageTest, pValues, correlationIsNotCausation],
}
