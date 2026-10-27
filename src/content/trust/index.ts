import type { Course } from '../types'
import { crossValidation } from './01-cross-validation'
import { tuning } from './02-tuning'
import { whereItIsWrong } from './03-where-it-is-wrong'
import { whatItUses } from './04-what-it-uses'
import { anInterval } from './05-an-interval'
import { whenNotToTrustIt } from './06-when-not-to-trust-it'
import { reproducible } from './07-reproducible'

export const trust: Course = {
  id: 'trust',
  title: "Validate and explain",
  sections: [crossValidation, tuning, whereItIsWrong, whatItUses, anInterval, whenNotToTrustIt, reproducible],
}
